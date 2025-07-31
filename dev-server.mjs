import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createRequire } from 'module';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3001;
const RENDER_API_URL = 'https://consumer-ai-render.onrender.com';

// Universal request logger middleware
app.use((req, res, next) => {
  console.log(`[PROXY] Received ${req.method} request for ${req.url}`);
  next();
});

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the public directory if needed
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'user-id'],
  credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));


app.use(express.json());

console.log('🚀 ConsumerAI API Proxy initializing...');
console.log('🔄 Forwarding all API requests to:', RENDER_API_URL);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API server is running on port 3001' });
});





app.post('/api/conversations', async (req, res) => {
  const { conversation_name, conversational_context, properties, persona_id, replica_id } = req.body;
  const apiKey = process.env.VITE_TAVUS_API_KEY;
  const apiUrl = process.env.VITE_TAVUS_API_URL;
  const personaId = persona_id || process.env.VITE_TAVUS_PERSONA_ID;
  const replicaId = replica_id || process.env.VITE_TAVUS_REPLICA_ID;

  try {
    const response = await fetch(`${apiUrl}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        replica_id: replicaId,
        persona_id: personaId,
        conversation_name,
        conversational_context,
        properties,
      }),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api', async (req, res, next) => {
  if (req.path === '/conversations') {
    return next();
  }
  
  const targetUrl = `${RENDER_API_URL}${req.url}`;
  console.log(`[PROXY] Forwarding ${req.method} request to: ${targetUrl}`);

  try {
    const headers = {
      ...req.headers,
      'user-id': req.headers['user-id'] || '',
      'Authorization': req.headers['authorization'] || '',
    };
    delete headers['host'];

    const fetchOptions = {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body && typeof req.body === 'object' ? JSON.stringify(req.body) : req.body : undefined,
    };

    const response = await fetch(targetUrl, fetchOptions);
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    res.status(response.status);
    const headersToForward = ['content-type', 'cache-control', 'etag'];
    headersToForward.forEach(header => {
      const value = response.headers.get(header);
      if (value) {
        res.set(header, value);
      }
    });
    res.send(data);
  } catch (error) {
    console.error(`[PROXY] Error forwarding request to ${targetUrl}:`, error);
    res.status(500).json({
      error: {
        message: 'Failed to forward request to Render API',
        details: error.message
      }
    });
  }
});

// Start HTTP server and attach Socket.IO
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('Socket.IO client connected:', socket.id);
  socket.on('join', (sessionId) => {
    socket.join(sessionId);
    console.log(`Socket ${socket.id} joined session ${sessionId}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 API proxy + Socket.IO running on http://localhost:${PORT}`);
  console.log(`🔄 Forwarding all API requests to ${RENDER_API_URL}`);
});