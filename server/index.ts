import dns from 'node:dns';
import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB, isDbConnected, isUsingFallback } from './config/db';
import { initDataStore } from './services/dataService';
import { initSocket } from './services/socket';

import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import ticketRoutes from './routes/tickets';
import checkInRoutes from './routes/checkin';
import aiRoutes from './routes/ai';

dotenv.config();

dns.setServers(['8.8.8.8', '1.1.1.1']);

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Initialize WebSockets for real-time seat availability & check-ins
initSocket(server);

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/checkin', checkInRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'EventPulse - Event Ticketing & Check-In System',
    database: isDbConnected() ? 'MongoDB Atlas Connected' : 'EventPulse In-Memory & Resilient Store',
    fallbackMode: isUsingFallback(),
    timestamp: new Date().toISOString(),
  });
});

// Serve frontend static build in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// For client-side routing fallback in production
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return next();
  }
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send(`
        <html>
          <head><title>EventPulse API</title></head>
          <body style="font-family: sans-serif; padding: 40px; text-align: center; background: #0f172a; color: #f8fafc;">
            <h1>🎟️ EventPulse Backend API Server is Running</h1>
            <p>API is available at <code>/api</code> endpoints.</p>
            <p>Vite Dev Server is available at <a href="http://localhost:3000" style="color: #6366f1;">http://localhost:3000</a></p>
          </body>
        </html>
      `);
    }
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  console.log('🚀 Initializing EventPulse Backend Server...');
  await connectDB();
  await initDataStore();

  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`✨ EventPulse Backend & WebSocket running on port ${PORT}`);
    console.log(`📡 REST API: http://localhost:${PORT}/api`);
    console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`⚡ WebSocket Server: Ready for live seat availability & check-in gates`);
    console.log(`======================================================\n`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
