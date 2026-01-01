import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { initializeSocketHandlers } from './src/lib/socket-server';

const port = parseInt(process.env.PORT || '3001', 10);

// Get allowed origins from environment or allow all in development
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://localhost:3001'];

const httpServer = createServer((req, res) => {
  // Health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }
  
  // CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bingo Socket.io Server Running');
});

// Initialize Socket.io with CORS
const io = new SocketIOServer(httpServer, {
  path: '/api/socketio',
  addTrailingSlash: false,
  cors: {
    origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Initialize socket handlers
initializeSocketHandlers(io);

httpServer.listen(port, () => {
  console.log(`> Socket.io server running on port ${port}`);
  console.log(`> Allowed origins: ${allowedOrigins.join(', ')}`);
});
