# 🎮 PlayPulse Multiplayer Arena

<p align="center">
  <img src="https://img.shields.io/badge/Status-Live%20Production-10B981?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Status" />
  <img src="https://img.shields.io/badge/Multiplayer-Real--Time%20WebSockets-8B5CF6?style=for-the-badge&logo=socketdotio&logoColor=white" alt="WebSockets" />
  <img src="https://img.shields.io/badge/Frontend-React%2019%20%2B%20Tailwind%20CSS-38BDF8?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express%20%2B%20ws-F59E0B?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/Made%20By-Rutvik%20Barot-EC4899?style=for-the-badge" alt="Author" />
</p>

---

## 🌐 Live Hosted Application

> ### 🚀 **Play Live Now:** [https://playpulse-multiplayer-arena.ai.studio/](https://playpulse-multiplayer-arena.ai.studio/)

Experience zero-latency, server-authoritative multiplayer browser gaming with your friends instantly using 6-character room codes or dynamic bot matchmaking.

---

## ⚡ Overview

**PlayPulse Multiplayer Arena** is a full-stack real-time multiplayer gaming hub engineered with a server-authoritative state engine, low-latency WebSocket synchronization, responsive audio synthesis, and Marvel superhero avatars.

### ✨ Key Features
- **Instant Room Codes**: Create private lobbies with custom max player limits or join via 6-digit alphanumeric room codes.
- **AI Bot Matchmaking**: Fill empty lobby slots instantly with automated intelligent bots for solo and practice sessions.
- **Marvel Superhero Roster**: 10 hand-crafted vector hero avatars (Iron Man, Spider-Man, Captain America, Thor, Hulk, Black Panther, Doctor Strange, Deadpool, Wolverine, Scarlet Witch).
- **Sound Effects Engine**: Web Audio API synthesized dynamic sound effects for dice rolls, moves, card drops, wins, and countdowns.
- **Mobile & Desktop Responsive**: Responsive design with touch controls and keyboard navigation.

---

## 🕹️ Game Library

| Game | Mode | Players | Description |
| :--- | :--- | :--- | :--- |
| **Tic-Tac-Toe** | Turn-Based | 2 Players | Fast-paced 3x3 strategic duel with a 15-second turn clock, win-streak counters, and interactive cell placement. |
| **Rock Paper Scissors** | Simultaneous Clash | 2–6 Players | Synchronized 3-2-1 countdown arena with simultaneous card reveal, streak tracking, and tournament series mode. |
| **Classic Ludo** | Strategic Board Race | 2–4 Players | Authentic 15x15 four-color quadrant board, animated 3D dice rolls, safe star tiles, opponent captures, and central home race. |
| **UNO Card Game** | High-Stakes Discard | 2–6 Players | Authentic UNO cards with 4 colors (Red, Blue, Green, Yellow), Action cards (Skip, Reverse, +2), Wild cards (+4), and SHOUT UNO button. |
| **Formula Mini Racing** | Grand Prix Arcade | 2–8 Players | 2.5D Canvas racing with steering, drift physics, turbo boost pads, and mystery boxes (Nitrous, Energy Shield, Oil Slicks). |

---

## 🦸 Marvel Character Roster

Play as your favorite superhero, each styled with unique color schemes and custom vector iconography:

1. 🔴 **Iron Man** (*Tony Stark*) — Crimson & Gold Arc Reactor
2. 🕷️ **Spider-Man** (*Peter Parker*) — Cobalt Blue & Web Red
3. 🛡️ **Captain America** (*Steve Rogers*) — Sky Blue & Vibranium Star Shield
4. ⚡ **Thor** (*God of Thunder*) — Asgardian Gold & Mjolnir Hammer
5. 🟢 **Hulk** (*Bruce Banner*) — Gamma Green Power Fist
6. 🟣 **Black Panther** (*King T'Challa*) — Wakandan Violet Kinetic Armor
7. 👁️ **Doctor Strange** (*Stephen Strange*) — Mystic Orange Eye of Agamotto
8. ⚔️ **Deadpool** (*Wade Wilson*) — Crimson & Stealth Dual Katanas
9. 🐾 **Wolverine** (*Logan*) — X-Men Gold & Adamantium Claws
10. 🔮 **Scarlet Witch** (*Wanda Maximoff*) — Chaos Magic Hex Tiara

---

## 🏗️ Architecture & Real-Time Synchronization

```
┌────────────────────────────────────────────────────────┐
│                   PlayPulse Client                     │
│    (React 19 / Next.js + Tailwind CSS + Web Audio)     │
└───────────────────────────▲────────────────────────────┘
                            │  WebSocket (Bidirectional)
                            ▼
┌────────────────────────────────────────────────────────┐
│               Server-Authoritative Core                │
│    (Node.js + Express + ws WebSocket Engine)           │
│                                                        │
│   ├── RoomManager (Lobby, Matchmaking, Reconnect)      │
│   ├── TicTacToeEngine                                  │
│   ├── RPSEngine                                        │
│   ├── LudoEngine (15x15 Board Matrix & Captures)       │
│   ├── CardBattleEngine (UNO Deck & Discard Mechanics)  │
│   └── MiniRacingEngine (Track Physics & Power-ups)     │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Converting to Next.js & Deploying to Vercel

### ⚠️ How WebSockets Work with Vercel & Next.js

> **Important Architecture Note:**
> Vercel's standard hosting environment runs on **Serverless & Edge Functions**, which are stateless and terminate after each request. Persistent, stateful WebSocket TCP servers (`ws` / `socket.io`) cannot run directly inside a serverless function on Vercel.

### 🌟 Recommended Production Strategy (Dual Architecture)

To run this Next.js app on Vercel with active WebSockets:

1. **Deploy Frontend on Vercel (Next.js)**:
   - Host all React UI views, audio engines, and client controllers on Vercel.
   - Point the WebSocket client to your hosted WebSocket server using an environment variable:
     ```env
     NEXT_PUBLIC_WS_URL=wss://your-backend-service.railway.app
     ```

2. **Deploy WebSocket Backend on a Persistent Node.js Host**:
   - Host `server.ts` / `server/` on a free/low-cost persistent Node.js host:
     - **Railway** / **Render** / **Fly.io** / **Google Cloud Run**
   - Simply deploy the repository with start command `node dist/server.cjs` or `tsx server.ts`.

3. **Or Deploy Full Next.js Container with Custom Server**:
   - Using Next.js custom `server.js` inside a Docker container on Cloud Run / Railway allows frontend + WebSockets on the exact same port.

---

## 🛠️ Local Development & Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-username/playpulse-multiplayer-arena.git
cd playpulse-multiplayer-arena

# 2. Install dependencies
npm install

# 3. Start development server (Frontend + WebSocket Server on Port 3000)
npm run dev

# 4. Open in browser
http://localhost:3000
```

---

## 📦 Build & Production

```bash
# Compile Vite frontend and bundle server
npm run build

# Run production server
npm start
```

---

## 👨‍💻 Author & Credits

Designed and developed with ❤️ and AI by **Rutvik Barot**  
- **Email:** rutbarot3011@gmail.com  
- **Live Demo:** [https://playpulse-multiplayer-arena.ai.studio/](https://playpulse-multiplayer-arena.ai.studio/)
