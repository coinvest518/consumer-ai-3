# ConsumerAI Backend Architecture

This document explains the architecture and functionality of the ConsumerAI backend.

## Server Setup

The backend consists of two main files:
1. **server.js** - The Express server setup
2. **api.js** - The API handler with all endpoint implementations

### Server.js

```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const apiHandler = require('./api');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: ['https://consumerai.info', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'user-id'],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'ConsumerAI API is running',
    timestamp: new Date().toISOString()
  });
});

// Route all API requests to the handler
app.use('/api', (req, res) => {
  // Modify the URL to match what the API handler expects
  req.url = req.url.replace(/^\/api/, '');
  if (req.url === '') req.url = '/';
  
  return apiHandler(req, res);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});
```

### Key Points About Server.js

1. **URL Path Handling**:
   - The server receives requests at `/api/*`
   - It strips the `/api` prefix before passing to the API handler
   - This means a request to `/api/chat` becomes just `/chat` when it reaches the API handler

2. **CORS Configuration**:
   - Allows requests from `https://consumerai.info` and `http://localhost:3000`
   - Allows the `user-id` header which is used for authentication

3. **Health Check**:
   - Direct endpoint at `/health` (not under `/api`)
   - Returns a simple status response

## API Handler (api.js)

The API handler implements all the endpoints and business logic:

### Key Components

1. **Supabase Integration**:
   ```javascript
   const supabase = createClient(
     process.env.SUPABASE_URL || '',
     process.env.SUPABASE_SERVICE_ROLE_KEY || '',
     {
       auth: {
         persistSession: false,
         autoRefreshToken: false
       }
     }
   );
   ```

2. **OpenAI Integration**:
   ```javascript
   const chatModel = new ChatOpenAI({
     openAIApiKey: process.env.OPENAI_API_KEY,
     modelName: 'gpt-4',
     temperature: 0.7,
   });
   ```

3. **Stripe Integration**:
   ```javascript
   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
     apiVersion: '2023-10-16'
   });
   ```

4. **In-Memory Chat Sessions**:
   ```javascript
   const chatSessions = new Map();
   
   function getChatHistory(sessionId) {
     if (!chatSessions.has(sessionId)) {
       chatSessions.set(sessionId, [
         new SystemMessage(
           "You are ConsumerAI, a helpful assistant specialized in consumer rights, " +
           "credit disputes, and financial advice. Be clear, professional, and focused on helping users " +
           "understand their rights and options."
         )
       ]);
     }
     return chatSessions.get(sessionId);
   }
   ```

### API Endpoints

The API handler uses a path-based routing approach:

```javascript
// Get the path from the URL
const path = req.url.split('?')[0].replace(/^\//, '') || '';
```

#### Chat Endpoints

1. **POST /chat**:
   - Processes a chat message
   - Requires `message` and `sessionId` in the request body
   - Returns AI response

2. **GET /chat/test**:
   - Test endpoint to verify the chat API is working

3. **GET /chat/history**:
   - Retrieves chat history for a user
   - Requires `user-id` header or query parameter
   - Fetches from Supabase `chat_history` table

#### Session Endpoints

1. **GET /session**:
   - Gets session information for a user
   - Requires `user-id` header or query parameter
   - Fetches from Supabase `profiles` table

2. **POST /session**:
   - Creates a new session
   - Creates a user profile if it doesn't exist
   - Returns session data

#### User Endpoints

1. **GET /users/limits**:
   - Gets usage limits for a user
   - Requires `user-id` header or query parameter
   - Fetches from Supabase `user_metrics` table

#### Storage Endpoints

1. **GET /storage/quota**:
   - Gets storage quota information for a user
   - Requires `user-id` header or query parameter
   - Fetches from Supabase `storage_limits` table

2. **POST /storage/upgrade**:
   - Initiates a storage plan upgrade
   - Creates a Stripe checkout session
   - Records the transaction in Supabase

#### Payment Endpoints

1. **POST /payments/verify**:
   - Verifies a payment session
   - Mock implementation for testing

2. **POST /stripe-webhook**:
   - Handles Stripe webhook events
   - Updates user metrics and records purchases

#### Template Endpoints

1. **POST /templates/use**:
   - Uses a template
   - Mock implementation for testing

#### Agent Endpoints

1. **POST /agents** or **POST /agents/process**:
   - Processes a message using an agent
   - Same implementation as the chat endpoint

## URL Path Structure

The complete URL path structure for API requests:

1. Frontend makes request to: `/api/chat`
2. Vercel routes this to: `https://consumer-ai-render.onrender.com/api/chat`
3. Express server receives at: `/api/chat`
4. Express strips `/api` prefix: `/chat`
5. API handler processes the path: `chat`

## Authentication

The backend uses a simple header-based authentication:

```javascript
const userId = req.headers['user-id'] || req.query.userId;

if (!userId) {
  return res.status(400).json({ error: 'Missing user ID' });
}
```

## Database Schema

The backend interacts with several Supabase tables:

1. **profiles**:
   - User profiles with basic information
   - Fields: id, email, questions_asked, questions_remaining, is_pro

2. **chat_history**:
   - Stores chat messages and responses
   - Fields: id, user_id, session_id, message, response, created_at

3. **user_metrics**:
   - Tracks usage metrics for users
   - Fields: user_id, daily_limit, chats_used, is_pro

4. **storage_limits**:
   - Tracks storage limits for users
   - Fields: user_id, max_storage_bytes, used_storage_bytes, max_files, used_files

5. **storage_transactions**:
   - Records storage upgrade transactions
   - Fields: user_id, amount_cents, storage_added_bytes, files_added, stripe_session_id, status

6. **purchases**:
   - Records purchases made by users
   - Fields: user_id, amount, credits, stripe_session_id, status

## Error Handling

The API handler uses a consistent error handling approach:

```javascript
try {
  // API logic here
} catch (error) {
  console.error(`[API Router] Error handling ${path}:`, error);
  return res.status(500).json({
    error: {
      message: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }
  });
}
```

## Deployment Considerations

1. **Environment Variables**:
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
   - OPENAI_API_KEY
   - STRIPE_SECRET_KEY
   - STRIPE_WEBHOOK_SECRET
   - PORT

2. **CORS Configuration**:
   - Update the CORS origin list when adding new domains

3. **Scaling**:
   - The in-memory chat sessions won't scale across multiple instances
   - Consider using a distributed cache like Redis for production