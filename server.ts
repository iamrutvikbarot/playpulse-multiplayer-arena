import express from 'express';
import http from 'http';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer } from 'ws';
import { RoomManager } from './server/RoomManager';

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  app.use(express.json());

  // Room Manager instance
  const roomManager = new RoomManager();

  // Attach WebSocket Server
  const wss = new WebSocketServer({ server });

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
      service: 'PlayPulse Real-Time Multiplayer Mini-Games Arena',
      timestamp: Date.now(),
    });
  });

  // Vite middleware in dev / Static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🎮 PlayPulse Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
