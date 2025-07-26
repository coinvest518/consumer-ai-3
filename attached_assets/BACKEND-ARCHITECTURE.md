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

## API Handler (api.js)

The API handler implements all endpoints, business logic, and agent tool orchestration. It supports:

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

5. **Agent Tools and Orchestration**:
   - Uses LangChain's `DynamicTool` to define a set of real tools, each with secure per-user logic where needed.
   - Tools are orchestrated by a supervisor agent that can decide to answer directly or invoke one or more tools.
   - Socket.IO is used for real-time agent step events to the frontend.

### Available Agent Tools

The following tools are available to the AI agent (all are orchestrated securely, and some require user authentication via Supabase JWT):

| Tool Name   | Description                                      | Security/Notes                                 |
|------------ |--------------------------------------------------|-----------------------------------------------|
| `search`    | Web search for legal info (Tavily API)           | Requires Tavily API key                       |
| `calendar`  | Set reminders, deadlines (Google Calendar)       | **Per-user, requires Supabase JWT**           |
| `report`    | Analyze credit reports (AI-powered)              | Uses OpenAI                                   |
| `letter`    | Generate dispute letters                         | Placeholder, to be implemented                |
| `legal`     | Legal database lookup (Astra DB, Tavily, AI)     | Uses Astra DB, Tavily, OpenAI                 |
| `email`     | Send email notifications (Nodemailer)            | Requires SMTP credentials                     |
| `tracking`  | Track certified mail (USPS Tracking 3.0 API)     | Requires USPS OAuth2 credentials              |
| `supervisor`| Orchestrates direct answers or tool invocations  | Uses OpenAI to classify and route             |

**Note:** The `calendar` tool is fully secure and per-user. It requires the frontend to send the Supabase JWT in the `Authorization` header. The backend verifies the JWT and uses the user's Google refresh token (stored in Supabase) to perform Google Calendar actions on behalf of the user.

### API Endpoints

The API handler uses a path-based routing approach:

```javascript
// Get the path from the URL
const path = req.url.split('?')[0].replace(/^\//, '') || '';
```
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
   - Processes a chat message using the LangChain agent and tools
   - Requires `message`, `sessionId`, and `socketId` in the request body
   - **If using tools that require authentication (e.g., `calendar`), the frontend must send the Supabase JWT in the `Authorization` header**
   - Returns AI response and emits real-time agent step events via Socket.IO

2. **GET /chat**:
   - Health check for the chat endpoint

3. **GET /chat/history**:
   - Retrieves chat history for a session
   - Requires `sessionId` in query or `x-session-id` header
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

The backend supports two authentication modes:

1. **Legacy (user-id header):**
   - Some endpoints accept a `user-id` header or query parameter for legacy support.

2. **Supabase JWT (recommended, secure):**
   - For all agent tool actions that require user-specific access (e.g., Google Calendar), the frontend must send the user's Supabase JWT in the `Authorization` header (as a Bearer token).
   - The backend verifies the JWT and fetches user info from Supabase before performing any per-user action.
   - Example:
     ```http
     Authorization: Bearer <supabase-jwt>
     ```
   - If the JWT is missing or invalid, the tool will return an error and not perform the action.

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

## Frontend Integration Notes

- The frontend must send the Supabase JWT in the `Authorization` header for any chat/tool request that requires user authentication (e.g., Google Calendar integration).
- All agent tools are defined in the backend. The frontend only triggers tool usage by sending user messages; it does not define or implement tools.
- Real-time agent step events are delivered to the frontend via Socket.IO using the provided `socketId`.

---

**This document is up to date as of July 2025 and reflects the current backend and agent tool architecture.**