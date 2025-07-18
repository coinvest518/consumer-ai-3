# API Integration Guide

This document explains the simplified approach to API integration in the ConsumerAI application.

## API URL Structure

The API URL structure has been simplified to avoid path issues:

1. Frontend always makes requests to `/api/endpoint`
2. Vercel routes `/api/*` requests to `https://consumer-ai-render.onrender.com/api/*`
3. Backend receives requests at `/api/*` and processes them

## API Client

The simplified API client (`api-client.ts`) handles all API requests with consistent URL construction:

```typescript
// Construct URL - always use /api/ path
const url = `${API_URL}/api/${normalizedEndpoint}`;
```

This ensures that:
1. All requests use the correct path structure
2. No double `/api/api/` paths are created
3. The backend receives requests in the expected format

## Environment Variables

Only one environment variable is needed:

```
VITE_API_URL=https://consumer-ai-render.onrender.com
```

This should be set in the Vercel environment variables.

## Authentication

User authentication is handled by:

1. Getting the user ID from Supabase storage
2. Including it in the `user-id` header for all requests
3. Including it in the request body for relevant endpoints

## API Endpoints

The simplified API client supports these endpoints:

1. `sendMessage(message, sessionId)` - Send a chat message
2. `getChatHistory(userId)` - Get chat history for a user
3. `createSession(data)` - Create a new chat session
4. `getSession(userId)` - Get session information
5. `getChatLimits(userId)` - Get user limits

## Troubleshooting

If you encounter API issues:

1. Check the browser console for request/response logs
2. Verify that the `user-id` header is being sent
3. Ensure the request body includes required parameters
4. Check that the URL structure is correct (should be `/api/endpoint`)

## Local Development

For local development, set the environment variable to:

```
VITE_API_URL=http://localhost:3001
```

This will route requests through the local proxy server.