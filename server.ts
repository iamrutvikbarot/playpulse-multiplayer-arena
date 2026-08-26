import express from 'express';
import http from 'http';
import next from 'next';
import { WebSocketServer } from 'ws';
import { RoomManager } from './server/RoomManager';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const PORT = parseInt(process.env.PORT || '3000', 10);

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

async function startServer() {
  const nextApp = next({ dev, hostname, port: PORT });
  const handle = nextApp.getRequestHandler();

  await nextApp.prepare();

  const app = express();
  const server = http.createServer(app);

  app.use(express.json());

  // Room Manager instance
  const roomManager = new RoomManager();

  // Create WebSocket Server with noServer: true to avoid conflict with Next.js HMR
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    socket.on('error', (err) => {
      console.error('Socket upgrade error:', err);
    });

    try {
      const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
      
      // Handle app WebSockets on /ws or /api/ws exclusively
      if (url.pathname === '/ws' || url.pathname === '/api/ws') {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });
      }
    } catch (err) {
      console.error('Error handling upgrade:', err);
    }
  });

  wss.on('connection', (ws) => {
    roomManager.registerSocket(ws);

    ws.on('message', (data) => {
      try {
        roomManager.handleMessage(ws, data.toString());
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
      }
    });

    ws.on('close', () => {
      roomManager.unregisterSocket(ws);
    });

    ws.on('error', (err) => {
      console.error('WebSocket client error:', err);
    });
  });

  // REST API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'PlayPulse Real-Time Multiplayer Mini-Games Arena (Next.js)',
      timestamp: Date.now(),
    });
  });

  // Delegate all other routes to Next.js App Router
  app.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🎮 PlayPulse Next.js Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
