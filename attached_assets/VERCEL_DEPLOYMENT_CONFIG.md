# Vercel Deployment Configuration

This document contains the configuration needed for successful Vercel deployment of the Consumer AI Chat application.

## vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "https://consumer-ai-render.onrender.com/api/$1" },
    { "src": "/(chat|session|agents|storage|templates|users|payments)/(.*)", "dest": "https://consumer-ai-render.onrender.com/api/$1/$2" },
    { "src": "/(.*\\.(js|css|ico|png|jpg|svg))", "dest": "/$1" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

## package.json scripts

Make sure the package.json includes these scripts:

```json
"scripts": {
  "build": "tsc && vite build",
  "vercel-build": "tsc && vite build"
}
```

## .vercelignore

Create a .vercelignore file with the following content:

```
node_modules
.git
.env
.env.*
api-backup
attached_assets
```

## API Configuration

In src/lib/api.ts, use the hardcoded Render API URL:

```typescript
// Direct URL to the Render backend
const RENDER_API_URL = "https://consumer-ai-render.onrender.com/api";
```

## Local Development

For local development, temporarily modify the API URL:

```typescript
// Change this line for local testing
const RENDER_API_URL = "http://localhost:3001/api";

// Then change it back for production before committing
// const RENDER_API_URL = "https://consumer-ai-render.onrender.com/api";
```

## Troubleshooting

If deployment fails:
1. Check that vercel.json is valid JSON
2. Ensure the build script works locally with `npm run build`
3. Make sure the dist directory contains index.html and assets
4. Remove any environment files (.env, .env.development, etc.) that might cause conflicts