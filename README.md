# 🎮 PlayPulse Multiplayer Arena

<p align="center">
  <img src="https://img.shields.io/badge/Status-Live%20Production-10B981?style=for-the-badge&logo=render&logoColor=white" alt="Render Live Status" />
  <img src="https://img.shields.io/badge/Multiplayer-Real--Time%20WebSockets-8B5CF6?style=for-the-badge&logo=socketdotio&logoColor=white" alt="WebSockets" />
  <img src="https://img.shields.io/badge/Voice%20%26%20Video-WebRTC%20P2P-38BDF8?style=for-the-badge&logo=webrtc&logoColor=white" alt="WebRTC" />
  <img src="https://img.shields.io/badge/Frontend-React%2019%20%2B%20Tailwind%20CSS-06B6D4?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express%20%2B%20ws-F59E0B?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/Made%20By-Rutvik%20Barot-EC4899?style=for-the-badge" alt="Author" />
</p>

---

## 🌐 Live Hosted Application

> ### 🚀 **Play Live Now:** [https://playpulse-multiplayer-arena.onrender.com/](https://playpulse-multiplayer-arena.onrender.com/)

Experience zero-latency, server-authoritative multiplayer browser gaming with your friends instantly using 6-character room codes, live WebRTC video/voice calls, and automated bot matchmaking.

---

## ⚡ Overview

**PlayPulse Multiplayer Arena** is a full-stack real-time multiplayer gaming hub engineered with a server-authoritative state engine, low-latency WebSocket synchronization, peer-to-peer WebRTC video/audio calls, responsive audio synthesis, and authentic Mahabharat legendary warrior avatars.

### ✨ Key Features
- **Instant Room Codes & QR Invite**: Create private lobbies with custom max player limits or join via 6-digit alphanumeric room codes and direct shareable URLs.
- **WebRTC P2P Voice & Video Calls**: Integrated real-time video feeds with speaker indicators, mute/camera toggles, screen sharing, mobile-optimized autoplay, and STUN NAT traversal.
- **Mahabharat Legendary Characters**: 10 hand-crafted vector warrior avatars (Shri Krishna, Arjuna, Karna, Bhishma Pitamah, Duryodhana, Draupadi, Bheema, Shakuni, Guru Dronacharya, Ashwatthama) with dynamic aura glow and 3D interactive physics.
- **In-Game Chat & Live Reactions**: Send real-time messages and trigger floating emoji particle bursts across the entire arena canvas.
- **AI Bot Matchmaking**: Fill empty lobby slots instantly with automated intelligent bots for solo and practice sessions.
- **Sound Effects Engine**: Web Audio API synthesized dynamic sound effects for dice rolls, moves, card drops, wins, and countdowns.
- **Mobile & Desktop Responsive**: Cross-platform adaptive design with full touch controls and mobile viewport optimization.

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

## ⚔️ Mahabharat Legendary Character Roster

Play as your favorite legendary warrior or deity, each styled with unique color schemes, divine weapons (Astras), and custom vector aura art:

1. 🦚 **Shri Krishna** (*Divine Charioteer & Jagadguru*) — Celestial Sky Blue (`#38BDF8`) & Sudarshana Chakra
2. 🏹 **Arjuna** (*Dhanurdhar Partha*) — Radiant Gold (`#EAB308`) & Gandiva Bow
3. ☀️ **Karna** (*Danveer Suryaputra*) — Solar Saffron (`#F97316`) & Divine Kavach-Kundal
4. 🛡️ **Bhishma Pitamah** (*Ganga Putra & Grand Patriarch*) — Silver Slate (`#E2E8F0`) & Iccha-Mrityu Boon
5. 🩸 **Duryodhana** (*Kaurava Crown Prince*) — Blood Crimson (`#DC2626`) & Vajra Spiked Gada
6. 🌸 **Draupadi** (*Yajnaseni & Panchali*) — Royal Lotus Magenta (`#EC4899`) & Sacred Agni Shakti
7. 🌪️ **Bheema** (*Vrikodara & Son of Vayu*) — Emerald Titan (`#10B981`) & Seismic Spiked Mace
8. 🎲 **Shakuni** (*Master of Cursed Dice*) — Mystic Poison Violet (`#9333EA`) & Enchanted Ivory Pasha
9. 🔮 **Guru Dronacharya** (*Supreme Archmaster*) — Vedic Royal Indigo (`#4F46E5`) & Brahmashira Astra
10. 💎 **Ashwatthama** (*Chiranjeevi Immortal Warrior*) — Mani Gem Cyan (`#06B6D4`) & Narayanastra

---

## 🏗️ Architecture & Real-Time Synchronization

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PlayPulse Client                              │
│       (React 19 + Tailwind CSS + Web Audio + WebRTC Media Engine)      │
└───────────────────▲────────────────────────────────▲───────────────────┘
                    │ WebSocket (TCP)                │ WebRTC (P2P Mesh)
                    │ Game State & Signaling         │ Video & Audio Streams
                    ▼                                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Server-Authoritative Core                         │
│               (Node.js + Express + ws WebSocket Engine)                │
│                                                                        │
│   ├── RoomManager (Lobby, Matchmaking, Signaling Relay, Reconnect)     │
│   ├── TicTacToeEngine                                                  │
│   ├── RPSEngine                                                        │
│   ├── LudoEngine (15x15 Board Matrix & Captures)                       │
│   ├── CardBattleEngine (UNO Deck & Discard Mechanics)                  │
│   └── MiniRacingEngine (Track Physics & Power-ups)                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Deployment (Render, Cloud Run, Railway)

The application is bundled into a single self-contained server with static asset serving:

```json
{
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
    "start": "node dist/server.cjs"
  }
}
```

### Deploying to Render
1. Create a new **Web Service** on [Render](https://render.com/).
2. Connect your GitHub repository.
3. Set **Build Command**: `npm install && npm run build`
4. Set **Start Command**: `npm start`
5. Set environment variable `NODE_ENV=production`.

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

Designed and developed with ❤️ by **Rutvik Barot**  
- **Email:** rutbarot3011@gmail.com  
- **Live Demo:** [https://playpulse-multiplayer-arena.onrender.com/](https://playpulse-multiplayer-arena.onrender.com/)

