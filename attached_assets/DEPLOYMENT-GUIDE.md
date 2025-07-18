# ConsumerAI Deployment Guide

This guide explains how to deploy your ConsumerAI application to production with your custom domain.

## Prerequisites

- Your custom domain name
- A Vercel account connected to your GitHub repository

## Deployment Steps

### 1. Push Your Code to GitHub

```bash
git add .
git commit -m "Ready for production deployment"
git push
```

### 2. Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and import your GitHub repository
2. Configure the build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Framework Preset: Vite

3. Set environment variables in the Vercel dashboard:
   - `VITE_API_URL`: https://consumer-ai-render.onrender.com
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

4. Deploy the project

### 3. Configure Your Custom Domain

1. In the Vercel dashboard, go to your project settings
2. Click on "Domains"
3. Add your custom domain
4. Follow Vercel's instructions to update your DNS settings
5. Wait for DNS propagation (can take up to 48 hours)

### 4. Update CORS Settings in Render

1. Go to your Render dashboard
2. Select your backend service
3. Go to Environment settings
4. Add/update the CORS_ORIGIN environment variable to include your domain:
   ```
   https://yourdomain.com
   ```

## Troubleshooting

If you encounter issues:

1. **API Connection Issues**: Check the browser console for network errors
2. **CORS Errors**: Make sure your domain is added to the CORS settings in Render
3. **Authentication Problems**: Verify Supabase credentials are correct
4. **Blank Page**: Check for JavaScript errors in the browser console

## Important Files

- **vercel.json**: Contains routing configuration for API requests
- **src/lib/enhanced-api.ts**: Handles API requests to the backend
- **src/lib/config.ts**: Configures the API base URL

## API URL Structure

The application uses the following URL structure:

- Frontend makes requests to `/api/chat`, `/api/session`, etc.
- Vercel routes these requests to `https://consumer-ai-render.onrender.com/api/chat`, etc.
- The Render backend processes these requests and returns responses