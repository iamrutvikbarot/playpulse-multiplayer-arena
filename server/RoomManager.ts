import { WebSocket } from 'ws';
import {
  ChatMessage,
  GameId,
  Player,
  RoomSettings,
  RoomState,
  WSMessage,
} from '../src/types/game';
import { IGameEngine } from './engines/BaseEngine';
import { CardBattleEngine } from './engines/CardBattleEngine';
import { LudoEngine } from './engines/LudoEngine';
import { MiniRacingEngine } from './engines/MiniRacingEngine';
import { RPSBattleEngine } from './engines/RPSBattleEngine';
import { TicTacToeEngine } from './engines/TicTacToeEngine';

interface ClientConnection {
  socket: WebSocket;
  playerId: string;
  roomCode: string | null;
  lastPing: number;
}

export class RoomManager {
  private rooms: Map<string, RoomState> = new Map();
  private gameEngines: Map<string, IGameEngine> = new Map();
  private connections: Map<WebSocket, ClientConnection> = new Map();
  private playerSockets: Map<string, WebSocket> = new Map();

  constructor() {
    // Start global tick loop (20Hz for high-precision racing & turn timers)
    setInterval(() => this.tick(), 50);
  }

  public registerSocket(ws: WebSocket) {
    this.connections.set(ws, {
      socket: ws,
      playerId: '',
      roomCode: null,
      lastPing: Date.now(),
    });
  }

  public unregisterSocket(ws: WebSocket) {
    const conn = this.connections.get(ws);
    if (conn) {
      if (conn.playerId) {
        this.playerSockets.delete(conn.playerId);
      }
      if (conn.roomCode) {
        this.handlePlayerDisconnect(conn.roomCode, conn.playerId);
      }
      this.connections.delete(ws);
    }
  }

  public handleMessage(ws: WebSocket, rawData: string) {
    let msg: WSMessage;
    try {
      msg = JSON.parse(rawData);
    } catch (e) {
      return;
    }

    const conn = this.connections.get(ws);
    if (!conn) return;

    if (msg.type === 'PING') {
      conn.lastPing = Date.now();
      this.send(ws, { type: 'PONG', payload: { time: Date.now() } });
      return;
    }

    // 1. CREATE ROOM
    if (msg.type === 'ROOM_CREATE') {
      const { player, initialGame, settings } = msg.payload || {};
      const roomCode = this.generateRoomCode();

      const hostPlayer: Player = {
        id: player.id || `p_${Date.now().toString(36)}`,
        name: (player.name || 'Host').slice(0, 16).trim(),
        characterId: player.characterId || 'char_ironman',
        isHost: true,
        isReady: true,
        isConnected: true,
        score: 0,
        joinedAt: Date.now(),
      };

      const defaultSettings: RoomSettings = {
        maxPlayers: 6,
        rpsRounds: 5,
        ticTacToeGrid: 3,
        racingLaps: 3,
        turnTimeoutSeconds: 15,
        ...settings,
      };

      const room: RoomState = {
        code: roomCode,
        hostId: hostPlayer.id,
        currentGame: (initialGame as GameId) || 'tic-tac-toe',
        gameStatus: 'lobby',
        players: [hostPlayer],
        settings: defaultSettings,
        chatMessages: [
          {
            id: `msg_${Date.now()}`,
            senderId: 'system',
            senderName: 'System',
            characterId: '',
            text: `Room ${roomCode} created! Share this code with friends.`,
            timestamp: Date.now(),
            isSystem: true,
          },
        ],
        rematchVotes: [],
        gameState: null,
      };

      this.rooms.set(roomCode, room);

      conn.playerId = hostPlayer.id;
      conn.roomCode = roomCode;
      this.playerSockets.set(hostPlayer.id, ws);

      this.broadcastRoom(roomCode);
      return;
    }

    // 2. JOIN ROOM
    if (msg.type === 'ROOM_JOIN') {
      const { roomCode, player } = msg.payload || {};
      const code = String(roomCode || '').toUpperCase().trim();
      const room = this.rooms.get(code);

      if (!room) {
        this.send(ws, {
          type: 'ERROR',
          payload: { message: `Room "${code}" does not exist. Check code and retry.` },
        });
        return;
      }

      if (room.players.length >= room.settings.maxPlayers && !room.players.some((p) => p.id === player.id)) {
        this.send(ws, {
          type: 'ERROR',
          payload: { message: 'Room is already full.' },
        });
        return;
      }

      // Check if reconnecting existing player
      const existingPlayer = room.players.find((p) => p.id === player.id);
      if (existingPlayer) {
        existingPlayer.isConnected = true;
        if (player.name) existingPlayer.name = player.name.slice(0, 16);
        if (player.characterId) existingPlayer.characterId = player.characterId;
      } else {
        // Resolve duplicate names
        let playerName = (player.name || 'Player').slice(0, 16).trim();
        const existingNames = room.players.map((p) => p.name.toLowerCase());
        if (existingNames.includes(playerName.toLowerCase())) {
          playerName = `${playerName} #${room.players.length + 1}`;
        }

        const newPlayer: Player = {
          id: player.id || `p_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`,
          name: playerName,
          characterId: player.characterId || 'char_wizard',
          isHost: room.players.length === 0,
          isReady: false,
          isConnected: true,
          score: 0,
          joinedAt: Date.now(),
        };

        room.players.push(newPlayer);
        room.chatMessages.push({
          id: `msg_${Date.now()}`,
          senderId: 'system',
          senderName: 'System',
          characterId: '',
          text: `${newPlayer.name} joined the room!`,
          timestamp: Date.now(),
          isSystem: true,
        });
      }

      conn.playerId = player.id;
      conn.roomCode = code;
      this.playerSockets.set(player.id, ws);

      this.broadcastRoom(code);
      return;
    }

    // 3. TOGGLE READY
    if (msg.type === 'PLAYER_READY') {
      const { roomCode, playerId, isReady } = msg.payload || {};
      const room = this.rooms.get(roomCode);
      if (!room) return;

      const p = room.players.find((pl) => pl.id === playerId);
      if (p) {
        p.isReady = typeof isReady === 'boolean' ? isReady : !p.isReady;
        this.broadcastRoom(roomCode);
      }
      return;
    }

    // 4. UPDATE PLAYER (Character, Name)
    if (msg.type === 'PLAYER_UPDATE') {
      const { roomCode, playerId, characterId, name } = msg.payload || {};
      const room = this.rooms.get(roomCode);
      if (!room) return;

      const p = room.players.find((pl) => pl.id === playerId);
      if (p) {
        if (characterId) p.characterId = characterId;
        if (name) p.name = String(name).slice(0, 16).trim();
        this.broadcastRoom(roomCode);
      }
      return;
    }

    // 5. ADD BOT
    if (msg.type === 'BOT_ADD') {
      const { roomCode } = msg.payload || {};
      const room = this.rooms.get(roomCode);
      if (!room || room.players.length >= room.settings.maxPlayers) return;

      const botNames = ['StarkBot', 'WebBot', 'ShieldBot', 'ThunderBot', 'GammaBot', 'PantherBot'];
      const botChars = ['char_ironman', 'char_spiderman', 'char_cap', 'char_thor', 'char_hulk', 'char_panther'];
      const usedNames = room.players.map((p) => p.name);
      const name = botNames.find((n) => !usedNames.includes(n)) || `Bot-${room.players.length + 1}`;
      const charId = botChars[room.players.length % botChars.length];

      const botPlayer: Player = {
        id: `bot_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        name: `🤖 ${name}`,
        characterId: charId,
        isHost: false,
        isReady: true,
        isBot: true,
        isConnected: true,
        score: 0,
        joinedAt: Date.now(),
      };

      room.players.push(botPlayer);
      room.chatMessages.push({
        id: `msg_${Date.now()}`,
        senderId: 'system',
        senderName: 'System',
        characterId: '',
        text: `${botPlayer.name} was added to the lobby.`,
        timestamp: Date.now(),
        isSystem: true,
      });

      this.broadcastRoom(roomCode);
      return;
    }

    // 6. REMOVE BOT
    if (msg.type === 'BOT_REMOVE') {
      const { roomCode, botId } = msg.payload || {};
      const room = this.rooms.get(roomCode);
      if (!room) return;

      room.players = room.players.filter((p) => p.id !== botId);
      this.broadcastRoom(roomCode);
      return;
    }

    // 7. SELECT GAME
    if (msg.type === 'GAME_SELECT') {
      const { roomCode, gameId } = msg.payload || {};
      const room = this.rooms.get(roomCode);
      if (!room) return;

      room.currentGame = gameId;
      room.chatMessages.push({
        id: `msg_${Date.now()}`,
        senderId: 'system',
        senderName: 'System',
        characterId: '',
        text: `Game changed to ${gameId.toUpperCase()}`,
        timestamp: Date.now(),
        isSystem: true,
      });

      this.broadcastRoom(roomCode);
      return;
    }

    // 8. START GAME
    if (msg.type === 'GAME_START') {
      const { roomCode } = msg.payload || {};
      const room = this.rooms.get(roomCode);
      if (!room) return;

      this.startGame(room);
      return;
    }

    // 9. GAME ACTION
    if (msg.type === 'GAME_ACTION') {
      const { roomCode, playerId, action } = msg.payload || {};
      const engine = this.gameEngines.get(roomCode);
      const room = this.rooms.get(roomCode);
      if (!engine || !room) return;

      const result = engine.handleAction(playerId, action);
      if (result.success) {
        room.gameState = engine.getPublicState();

        if (result.finishGame) {
          room.gameStatus = 'game-over';
          if (result.finishGame.scores) {
            room.players.forEach((p) => {
              if (result.finishGame?.scores?.[p.id] !== undefined) {
                p.score = result.finishGame.scores[p.id];
              }
            });
          }
        }

        this.broadcastRoom(roomCode);
      }
      return;
    }

    // 10. REMATCH VOTE
    if (msg.type === 'REMATCH_VOTE') {
      const { roomCode, playerId } = msg.payload || {};
      const room = this.rooms.get(roomCode);
      if (!room) return;

      if (!room.rematchVotes.includes(playerId)) {
        room.rematchVotes.push(playerId);
      }

      // Check if majority/all players voted rematch
      const humanPlayers = room.players.filter((p) => !p.isBot);
      if (room.rematchVotes.length >= Math.ceil(humanPlayers.length / 2)) {
        this.startGame(room);
      } else {
        this.broadcastRoom(roomCode);
      }
      return;
    }

    // 11. RETURN TO LOBBY
    if (msg.type === 'RETURN_TO_LOBBY') {
      const { roomCode } = msg.payload || {};
      const room = this.rooms.get(roomCode);
      if (!room) return;

      room.gameStatus = 'lobby';
      room.rematchVotes = [];
      this.gameEngines.delete(roomCode);
      room.gameState = null;

      room.players.forEach((p) => {
        if (!p.isHost && !p.isBot) p.isReady = false;
      });

      this.broadcastRoom(roomCode);
      return;
    }

    // 12. CHAT MESSAGE / EMOTE
    if (msg.type === 'CHAT_MESSAGE' || msg.type === 'CHAT_EMOTE') {
      const { roomCode, playerId, text, isEmote } = msg.payload || {};
      const room = this.rooms.get(roomCode);
      if (!room) return;

      const player = room.players.find((p) => p.id === playerId);
      if (player && text) {
        const chatMsg: ChatMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          senderId: player.id,
          senderName: player.name,
          characterId: player.characterId,
          text: String(text).slice(0, 120),
          timestamp: Date.now(),
          isEmote: Boolean(isEmote),
        };

        room.chatMessages.push(chatMsg);
        if (room.chatMessages.length > 50) room.chatMessages.shift();

        this.broadcastRoom(roomCode);
      }
      return;
    }
  }

  private startGame(room: RoomState) {
    let engine: IGameEngine;

    switch (room.currentGame) {
      case 'tic-tac-toe':
        engine = new TicTacToeEngine();
        break;
      case 'rps-battle':
        engine = new RPSBattleEngine();
        break;
      case 'ludo':
        engine = new LudoEngine();
        break;
      case 'card-battle':
        engine = new CardBattleEngine();
        break;
      case 'mini-racing':
        engine = new MiniRacingEngine();
        break;
      default:
        engine = new TicTacToeEngine();
    }

    const state = engine.init(room.players, room.settings);
    this.gameEngines.set(room.code, engine);

    room.gameStatus = 'playing';
    room.rematchVotes = [];
    room.gameState = state;

    room.chatMessages.push({
      id: `msg_${Date.now()}`,
      senderId: 'system',
      senderName: 'System',
      characterId: '',
      text: `🎮 Match started: ${room.currentGame.toUpperCase()}!`,
      timestamp: Date.now(),
      isSystem: true,
    });

    this.broadcastRoom(room.code);
  }

  private tick() {
    const deltaMs = 50;

    for (const [roomCode, engine] of this.gameEngines.entries()) {
      const room = this.rooms.get(roomCode);
      if (!room || room.gameStatus !== 'playing') continue;

      // Handle AI Bot behaviors for active turns
      this.handleBotTurn(room, engine);

      if (engine.tick) {
        const result = engine.tick(deltaMs);
        if (result && result.success) {
          room.gameState = engine.getPublicState();

          if (result.finishGame) {
            room.gameStatus = 'game-over';
            if (result.finishGame.scores) {
              room.players.forEach((p) => {
                if (result.finishGame?.scores?.[p.id] !== undefined) {
                  p.score = result.finishGame.scores[p.id];
                }
              });
            }
          }

          this.broadcastRoom(roomCode);
        }
      }
    }
  }

  private handleBotTurn(room: RoomState, engine: IGameEngine) {
    if (!room.gameState || room.gameStatus !== 'playing') return;

    // 1. Tic-Tac-Toe Bot
    if (room.currentGame === 'tic-tac-toe') {
      const ttt = room.gameState;
      const currentPid = ttt.currentTurnPlayerId;
      const bot = room.players.find((p) => p.id === currentPid && p.isBot);
      if (bot && !ttt.winnerId) {
        const emptyCells = ttt.board
          .map((c: any, i: number) => (c === null ? i : null))
          .filter((i: any): i is number => i !== null);
        if (emptyCells.length > 0) {
          const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
          setTimeout(() => {
            const res = engine.handleAction(bot.id, { type: 'MAKE_MOVE', payload: { cellIndex: cell } });
            if (res.success) {
              room.gameState = engine.getPublicState();
              if (res.finishGame) room.gameStatus = 'game-over';
              this.broadcastRoom(room.code);
            }
          }, 600);
        }
      }
    }

    // 2. RPS Battle Bot
    if (room.currentGame === 'rps-battle') {
      const rps = room.gameState;
      if (rps.phase === 'choosing') {
        room.players.forEach((p) => {
          if (p.isBot && !rps.roundChoices[p.id]) {
            const opts = ['rock', 'paper', 'scissors'];
            const choice = opts[Math.floor(Math.random() * opts.length)];
            engine.handleAction(p.id, { type: 'SELECT_CHOICE', payload: { choice } });
            room.gameState = engine.getPublicState();
            this.broadcastRoom(room.code);
          }
        });
      }
    }

    // 3. Ludo Bot
    if (room.currentGame === 'ludo') {
      const ludo = room.gameState;
      const currentPid = ludo.currentTurnPlayerId;
      const bot = room.players.find((p) => p.id === currentPid && p.isBot);
      if (bot) {
        if (!ludo.diceRolled) {
          setTimeout(() => {
            const res = engine.handleAction(bot.id, { type: 'ROLL_DICE' });
            if (res.success) {
              room.gameState = engine.getPublicState();
              this.broadcastRoom(room.code);
            }
          }, 800);
        } else if (ludo.movableTokenIds.length > 0) {
          setTimeout(() => {
            const tokenId = ludo.movableTokenIds[Math.floor(Math.random() * ludo.movableTokenIds.length)];
            const res = engine.handleAction(bot.id, { type: 'MOVE_TOKEN', payload: { tokenId } });
            if (res.success) {
              room.gameState = engine.getPublicState();
              if (res.finishGame) room.gameStatus = 'game-over';
              this.broadcastRoom(room.code);
            }
          }, 600);
        }
      }
    }

    // 4. Card Battle Bot
    if (room.currentGame === 'card-battle') {
      const cardState = room.gameState;
      const currentPid = cardState.currentTurnPlayerId;
      const bot = room.players.find((p) => p.id === currentPid && p.isBot);
      if (bot) {
        const botPrivState = engine.getPublicState(bot.id);
        const validIds: string[] = botPrivState.validPlayableCardIds || [];
        setTimeout(() => {
          if (validIds.length > 0) {
            const chosenId = validIds[Math.floor(Math.random() * validIds.length)];
            const chosenCard = botPrivState.myHand.find((c: any) => c.id === chosenId);
            const chosenColor = chosenCard?.color === 'wild' ? 'crimson' : undefined;
            const res = engine.handleAction(bot.id, {
              type: 'PLAY_CARD',
              payload: { cardId: chosenId, chosenColor },
            });
            if (res.success) {
              room.gameState = engine.getPublicState();
              if (res.finishGame) room.gameStatus = 'game-over';
              this.broadcastRoom(room.code);
            }
          } else {
            const res = engine.handleAction(bot.id, { type: 'DRAW_CARD' });
            if (res.success) {
              room.gameState = engine.getPublicState();
              this.broadcastRoom(room.code);
            }
          }
        }, 800);
      }
    }

    // 5. Mini Racing Bot
    if (room.currentGame === 'mini-racing') {
      const race = room.gameState;
      if (race.raceStatus === 'racing') {
        room.players.forEach((p) => {
          if (p.isBot) {
            const racer = race.racers[p.id];
            if (racer && racer.finishTime === null) {
              // Basic steering towards next checkpoint waypoint
              const checkpoints = [
                { x: 500, y: 100 },
                { x: 820, y: 140 },
                { x: 860, y: 380 },
                { x: 680, y: 500 },
                { x: 300, y: 480 },
                { x: 140, y: 320 },
                { x: 220, y: 140 },
              ];
              const nextCp = checkpoints[(racer.checkpoint + 1) % checkpoints.length];
              const targetAngle = Math.atan2(nextCp.y - racer.y, nextCp.x - racer.x);
              let angleDiff = targetAngle - racer.angle;
              while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
              while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

              const steer = Math.max(-1, Math.min(1, angleDiff * 2));
              engine.handleAction(p.id, {
                type: 'UPDATE_INPUT',
                payload: {
                  steer,
                  accelerate: true,
                  brake: false,
                  useItem: Boolean(racer.activeItem),
                },
              });
            }
          }
        });
      }
    }
  }

  private broadcastRoom(roomCode: string) {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    const engine = this.gameEngines.get(roomCode);

    room.players.forEach((p) => {
      if (p.isBot) return;
      const socket = this.playerSockets.get(p.id);
      if (socket && socket.readyState === WebSocket.OPEN) {
        const tailoredState = engine ? engine.getPublicState(p.id) : room.gameState;
        this.send(socket, {
          type: 'ROOM_SYNC',
          payload: {
            ...room,
            gameState: tailoredState,
          },
        });
      }
    });
  }

  private handlePlayerDisconnect(roomCode: string, playerId: string) {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    const player = room.players.find((p) => p.id === playerId);
    if (player) {
      player.isConnected = false;

      // Grace period before removing player
      setTimeout(() => {
        const currentRoom = this.rooms.get(roomCode);
        if (!currentRoom) return;
        const pl = currentRoom.players.find((p) => p.id === playerId);
        if (pl && !pl.isConnected) {
          currentRoom.players = currentRoom.players.filter((p) => p.id !== playerId);

          // If host left, assign new host
          if (pl.isHost && currentRoom.players.length > 0) {
            const nextHost = currentRoom.players.find((p) => !p.isBot) || currentRoom.players[0];
            if (nextHost) nextHost.isHost = true;
          }

          // If room empty, clean up
          if (currentRoom.players.length === 0) {
            this.rooms.delete(roomCode);
            this.gameEngines.delete(roomCode);
          } else {
            this.broadcastRoom(roomCode);
          }
        }
      }, 10000);

      this.broadcastRoom(roomCode);
    }
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    do {
      code = '';
      for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.rooms.has(code));
    return code;
  }

  private send(ws: WebSocket, msg: WSMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }
}
