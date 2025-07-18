# Testing with the Real Render Backend

This guide explains how to run your frontend locally while connecting to the real Render backend API.

## Understanding the Setup

By default, when you run `npm run dev`, it starts:
1. A local Express API server (dev-server.mjs) on port 3001
2. A Vite frontend server on port 3000 that proxies `/api` requests to the local server

To test with the real Render backend, we need to modify this setup to proxy requests to Render instead.

## How to Test with the Real Render Backend

### Method 1: Using the Batch Script

1. Run the provided batch script:
   ```
   start-with-render.bat
   ```

   This script will:
   - Replace the Vite config with one that points to the Render API
   - Start only the frontend server
   - The frontend will proxy all API requests to Render

2. Open your browser and go to:
   ```
   http://localhost:3000
   ```

### Method 2: Manual Setup

1. Make a backup of your original Vite config:
   ```
   copy vite.config.ts vite.config.ts.backup
   ```

2. Replace it with the Render-specific config:
   ```
   copy vite.config.render.ts vite.config.ts
   ```

3. Start only the frontend:
   ```
   npm run dev:frontend
   ```

4. When done, restore the original config:
   ```
   copy vite.config.ts.backup vite.config.ts
   ```

## Verifying the Connection

To verify you're connected to the Render API:

1. Open your browser's developer tools (F12)
2. Go to the Network tab
3. Look for API requests to `/api/*`
4. Check that they're being sent to `https://consumer-ai-render.onrender.com`

## Troubleshooting

If you encounter CORS issues:
- The Render API might be blocking requests from localhost
- Check the CORS configuration in your Render deployment

If authentication fails:
- Make sure your Supabase credentials are correct
- Check that the user ID is being properly sent in requests