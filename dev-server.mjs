import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3001; // Fixed port for API server, separate from frontend
// The base URL for the Render API (should NOT end with /api)
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
// Explicitly configure CORS to handle preflight requests and custom headers
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Allow requests from your Vite frontend and the API server
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'user-id'], // IMPORTANT: Allow the custom user-id header
  credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes

// Parse JSON bodies
app.use(express.json());

console.log('🚀 ConsumerAI API Proxy initializing...');
console.log('🔄 Forwarding all API requests to:', RENDER_API_URL);

// Proxy all API requests to Render
// Local proxy for the Tavus /api/conversations endpoint
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

app.use('/api', async (req, res) => {
  // Forward to /api/* on the backend, do not double /api
  const targetUrl = `${RENDER_API_URL}${req.url}`;
  console.log(`[PROXY] Forwarding ${req.method} request to: ${targetUrl}`);

  try {
    // Forward the request to Render
    const headers = {
      ...req.headers,
      'user-id': req.headers['user-id'] || '',
      'Authorization': req.headers['authorization'] || '',
    };
    // Remove host header to avoid issues
    delete headers['host'];

    const fetchOptions = {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body && typeof req.body === 'object' ? JSON.stringify(req.body) : req.body : undefined,
    };

    const response = await fetch(targetUrl, fetchOptions);

    // Get the response data
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Forward the response status and data back to the client
    res.status(response.status);

    // Forward relevant headers
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
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

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
  // Example: join room, handle events, etc.
  socket.on('join', (sessionId) => {
    socket.join(sessionId);
    console.log(`Socket ${socket.id} joined session ${sessionId}`);
  });
  // Add more event handlers as needed
});

httpServer.listen(PORT, () => {
  console.log(`🚀 API proxy + Socket.IO running on http://localhost:${PORT}`);
  console.log(`🔄 Forwarding all API requests to ${RENDER_API_URL}`);
});