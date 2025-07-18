# Consolidated API Router

This project uses a consolidated API router approach to stay within Vercel's Hobby plan limit of 12 serverless functions.

## How It Works

All API requests are routed through a single serverless function (`api/index.ts`), which then directs the request to the appropriate handler based on the URL path.

## API Routes

- `/api/chat` - Chat with the AI assistant
- `/api/chat/history` - Get chat history
- `/api/session` - Manage user sessions
- `/api/stripe-webhook` - Handle Stripe webhook events
- `/api/storage/upgrade` - Handle storage plan upgrades
- `/api/storage/webhook` - Handle storage-related webhook events
- `/api/health` - Health check endpoint

## Adding New Routes

To add a new route:

1. Create your handler file in the appropriate directory
2. Import the handler in `api/index.ts`
3. Add a new case to the switch statement in `api/index.ts`

## Vercel Configuration

The `vercel.json` file is configured to route all API requests to the single serverless function:

```json
{
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/index.ts" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

This approach allows us to have many logical API endpoints while only using a single serverless function deployment.