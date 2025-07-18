# API Endpoints Configuration

This document explains how the frontend connects to the backend API.

## API URL Structure

The frontend connects to the Render backend using the base URL:

```
https://consumer-ai-render.onrender.com/api
```

Endpoints are relative to this base URL, for example:
- `/chat`
- `/session`
- `/chat/history`

## Vercel Routing

The Vercel configuration routes API requests to the Render backend:

```json
{
  "routes": [
    { "src": "/api/(.*)", "dest": "https://consumer-ai-render.onrender.com/api/$1" },
    { "src": "/(chat|session|agents|storage|templates|users|payments)/(.*)", "dest": "https://consumer-ai-render.onrender.com/api/$1/$2" }
  ]
}
```

This means:
- Requests to `/api/chat/history` are forwarded to `https://consumer-ai-render.onrender.com/api/chat/history`
- Requests to `/chat/history` are forwarded to `https://consumer-ai-render.onrender.com/api/chat/history`

This configuration ensures that all API requests are properly routed to the backend with the correct `/api` prefix.

## Local Development

For local development, you can modify the `RENDER_API_URL` in `src/lib/api.ts`:

```typescript
// Change this for local development
const RENDER_API_URL = "http://localhost:3001/api";

// Change back for production
// const RENDER_API_URL = "https://consumer-ai-render.onrender.com/api";
```

## API Endpoints

The following endpoints are used by the frontend:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/chat` | POST | Send a message to the AI |
| `/session` | GET | Get the current session |
| `/session` | POST | Create a new session |
| `/chat/history` | GET | Get chat history |
| `/storage/upgrade` | POST | Upgrade storage plan |
| `/storage/quota` | GET | Get storage quota |
| `/agents` | POST | Process agent message |
| `/templates/use` | POST | Use a template |
| `/users/limits` | GET | Get user limits |
| `/chat/test` | GET | Test chat endpoint |
| `/payments/verify` | POST | Verify payment |

## Troubleshooting

If you see duplicate `/api/api/` in your network requests, check the Vercel routing configuration in `vercel.json`. The route that forwards `/api/...` requests should point to `https://consumer-ai-render.onrender.com/...` (without the `/api` prefix).