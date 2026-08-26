import {
  Card,
  CardBattlePlayerState,
  CardBattlePublicState,
  CardColor,
  CardValue,
  Player,
  RoomSettings,
} from '../../src/types/game';
import { GameActionResult, IGameEngine } from './BaseEngine';

export class CardBattleEngine implements IGameEngine {
  private players: Player[] = [];
  private settings!: RoomSettings;

  private drawPile: Card[] = [];
  private discardPile: Card[] = [];
  private playerHands: Record<string, Card[]> = {};

  private publicState!: CardBattlePublicState;

  public init(players: Player[], settings: RoomSettings): CardBattlePublicState {
    this.players = [...players];
    this.settings = settings;

    this.drawPile = this.generateDeck();
    this.shuffle(this.drawPile);

    this.playerHands = {};
    const playerCardCounts: Record<string, number> = {};
    const unoDeclared: Record<string, boolean> = {};

    // Deal 7 cards each
    players.forEach((p) => {
      this.playerHands[p.id] = this.drawCards(7);
      playerCardCounts[p.id] = 7;
      unoDeclared[p.id] = false;
    });

    // Flip top non-wild card to start discard pile
    let topCard = this.drawPile.pop()!;
    while (topCard.color === 'wild') {
      this.drawPile.unshift(topCard);
      this.shuffle(this.drawPile);
      topCard = this.drawPile.pop()!;
    }
    this.discardPile = [topCard];

    this.publicState = {
      discardTopCard: topCard,
      activeColor: topCard.color,
      direction: 1,
      currentTurnPlayerId: players[0]?.id || '',
      drawPileCount: this.drawPile.length,
      playerCardCounts,
      unoDeclared,
      winnerId: null,
      turnDeadline: Date.now() + 20000,
      lastPlayedCard: null,
      accumulatedDrawCount: 0,
    };

    return this.publicState;
  }

  public getPublicState(forPlayerId?: string): CardBattlePlayerState | CardBattlePublicState {
    if (!forPlayerId) return this.publicState;

    const myHand = this.playerHands[forPlayerId] || [];
    const validPlayableCardIds = myHand
      .filter((card) => this.isCardPlayable(card))
      .map((c) => c.id);

    return {
      ...this.publicState,
      myHand,
      validPlayableCardIds:
        forPlayerId === this.publicState.currentTurnPlayerId ? validPlayableCardIds : [],
    };
  }

  public reset(): void {
    this.init(this.players, this.settings);
  }

  public handleAction(playerId: string, action: { type: string; payload?: any }): GameActionResult {
    if (this.publicState.winnerId !== null) {
      return { success: false, error: 'Game is over' };
    }

    if (playerId !== this.publicState.currentTurnPlayerId) {
      return { success: false, error: 'Not your turn' };
    }

    // 1. PLAY CARD
    if (action.type === 'PLAY_CARD') {
      const { cardId, chosenColor } = action.payload || {};
      const hand = this.playerHands[playerId] || [];
      const cardIndex = hand.findIndex((c) => c.id === cardId);

      if (cardIndex === -1) {
        return { success: false, error: 'Card not in hand' };
      }

      const card = hand[cardIndex];
      if (!this.isCardPlayable(card)) {
        return { success: false, error: 'Cannot play this card on current pile' };
      }

      // If wild card, chosenColor must be provided
      let effectiveColor: CardColor = card.color;
      if (card.color === 'wild') {
        if (!['red', 'blue', 'green', 'yellow'].includes(chosenColor)) {
          return { success: false, error: 'Must choose a valid color for wild card' };
        }
        effectiveColor = chosenColor;
      }

      // Remove card from hand
      hand.splice(cardIndex, 1);
      this.discardPile.push(card);

      this.publicState.discardTopCard = card;
      this.publicState.activeColor = effectiveColor;
      this.publicState.lastPlayedCard = { playerId, card };
      this.publicState.playerCardCounts[playerId] = hand.length;

      // Check win condition
      if (hand.length === 0) {
        this.publicState.winnerId = playerId;
        return {
          success: true,
          state: this.publicState,
          finishGame: {
            winnerId: playerId,
          },
          broadcastAll: true,
        };
      }

      // Apply special card effects
      this.applyCardEffect(card);

      return { success: true, state: this.publicState, broadcastAll: true };
    }

    // 2. DRAW CARD
    if (action.type === 'DRAW_CARD') {
      const drawn = this.drawCards(1);
      if (drawn.length > 0) {
        this.playerHands[playerId].push(...drawn);
        this.publicState.playerCardCounts[playerId] = this.playerHands[playerId].length;
        this.publicState.drawPileCount = this.drawPile.length;
      }

      // Pass turn to next player
      this.advanceTurn(1);
      return { success: true, state: this.publicState, broadcastAll: true };
    }

    // 3. DECLARE UNO / LAST CARD
    if (action.type === 'DECLARE_UNO') {
      this.publicState.unoDeclared[playerId] = true;
      return { success: true, state: this.publicState, broadcastAll: true };
    }

    return { success: false, error: 'Unknown action' };
  }

  private applyCardEffect(card: Card) {
    if (card.value === 'reverse') {
      if (this.players.length === 2) {
        // In 2 player, reverse acts like skip
        this.advanceTurn(2);
      } else {
        this.publicState.direction = (this.publicState.direction * -1) as 1 | -1;
        this.advanceTurn(1);
      }
    } else if (card.value === 'skip') {
      this.advanceTurn(2);
    } else if (card.value === 'draw2') {
      const nextPid = this.getNextPlayerId(1);
      const drawn = this.drawCards(2);
      if (this.playerHands[nextPid]) {
        this.playerHands[nextPid].push(...drawn);
        this.publicState.playerCardCounts[nextPid] = this.playerHands[nextPid].length;
      }
      this.publicState.drawPileCount = this.drawPile.length;
      this.advanceTurn(2); // Skips victim's turn
    } else if (card.value === 'wild4') {
      const nextPid = this.getNextPlayerId(1);
      const drawn = this.drawCards(4);
      if (this.playerHands[nextPid]) {
        this.playerHands[nextPid].push(...drawn);
        this.publicState.playerCardCounts[nextPid] = this.playerHands[nextPid].length;
      }
      this.publicState.drawPileCount = this.drawPile.length;
      this.advanceTurn(2); // Skips victim's turn
    } else {
      // Regular number card or wild
      this.advanceTurn(1);
    }
  }

  private isCardPlayable(card: Card): boolean {
    if (card.color === 'wild') return true;
    if (card.color === this.publicState.activeColor) return true;
    if (card.value === this.publicState.discardTopCard.value) return true;
    return false;
  }

  private advanceTurn(steps: number) {
    this.publicState.currentTurnPlayerId = this.getNextPlayerId(steps);
    this.publicState.turnDeadline = Date.now() + 20000;
  }

  private getNextPlayerId(steps: number): string {
    const currentIdx = this.players.findIndex(
      (p) => p.id === this.publicState.currentTurnPlayerId
    );
    if (currentIdx === -1) return this.players[0]?.id || '';

    const count = this.players.length;
    const offset = steps * this.publicState.direction;
    const nextIdx = (((currentIdx + offset) % count) + count) % count;
    return this.players[nextIdx].id;
  }

  private drawCards(count: number): Card[] {
    const drawn: Card[] = [];
    for (let i = 0; i < count; i++) {
      if (this.drawPile.length === 0) {
        this.reshuffleDiscardIntoDraw();
      }
      if (this.drawPile.length > 0) {
        drawn.push(this.drawPile.pop()!);
      }
    }
    return drawn;
  }

  private reshuffleDiscardIntoDraw() {
    if (this.discardPile.length <= 1) return;
    const top = this.discardPile.pop()!;
    this.drawPile = [...this.discardPile];
    this.discardPile = [top];
    this.shuffle(this.drawPile);
  }

  private generateDeck(): Card[] {
    const colors: CardColor[] = ['red', 'blue', 'green', 'yellow'];
    const deck: Card[] = [];
    let idCounter = 1;

    colors.forEach((color) => {
      // 0 card (1 per color)
      deck.push({ id: `card_${idCounter++}`, color, value: '0', scoreValue: 0 });

      // 1-9 cards (2 of each per color)
      for (let n = 1; n <= 9; n++) {
        const val = String(n) as CardValue;
        deck.push({ id: `card_${idCounter++}`, color, value: val, scoreValue: n });
        deck.push({ id: `card_${idCounter++}`, color, value: val, scoreValue: n });
      }

      // Action cards (2 of each per color)
      const actions: CardValue[] = ['skip', 'reverse', 'draw2'];
      actions.forEach((val) => {
        deck.push({ id: `card_${idCounter++}`, color, value: val, scoreValue: 20 });
        deck.push({ id: `card_${idCounter++}`, color, value: val, scoreValue: 20 });
      });
    });

    // 4 Wild and 4 Wild Draw4 cards
    for (let i = 0; i < 4; i++) {
      deck.push({ id: `card_${idCounter++}`, color: 'wild', value: 'wild', scoreValue: 50 });
      deck.push({ id: `card_${idCounter++}`, color: 'wild', value: 'wild4', scoreValue: 50 });
    }

    return deck;
  }

  private shuffle(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  public tick(_deltaMs: number): GameActionResult | null {
    if (this.publicState.winnerId !== null) return null;

    // Timeout -> auto-draw or play
    if (Date.now() > this.publicState.turnDeadline) {
      const currPid = this.publicState.currentTurnPlayerId;
      const hand = this.playerHands[currPid] || [];
      const playable = hand.find((c) => this.isCardPlayable(c));

      if (playable) {
        return this.handleAction(currPid, {
          type: 'PLAY_CARD',
          payload: {
            cardId: playable.id,
            chosenColor: playable.color === 'wild' ? 'red' : undefined,
          },
        });
      } else {
        return this.handleAction(currPid, { type: 'DRAW_CARD' });
      }
    }

    return null;
  }

  public onPlayerLeave(playerId: string): GameActionResult | null {
    if (this.publicState.currentTurnPlayerId === playerId) {
      this.advanceTurn(1);
      return { success: true, state: this.publicState, broadcastAll: true };
    }
    return null;
  }
}
