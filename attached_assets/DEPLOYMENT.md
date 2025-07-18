# Deployment Guide

This guide explains how to deploy your ConsumerAI application to production with your custom domain.

## Prerequisites

- Your custom domain name
- A hosting service (Vercel recommended)
- Git repository with your code

## Deployment Steps

### 1. Build the Application Locally (Optional)

```bash
npm run build
```

This will create a `dist` folder with the production-ready files.

### 2. Deploy to Vercel

1. Push your code to your Git repository:
   ```bash
   git add .
   git commit -m "Configure for production"
   git push
   ```

2. Connect your repository to Vercel:
   - Go to [Vercel](https://vercel.com)
   - Import your Git repository
   - Configure the build settings:
     - Build Command: `npm run build`
     - Output Directory: `dist`

3. Set environment variables in the Vercel dashboard:
   - `VITE_API_URL`: Your Render API URL (e.g., https://consumer-ai-render.onrender.com)
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

### 3. Configure Your Custom Domain

1. In the Vercel dashboard, go to your project settings
2. Click on "Domains"
3. Add your custom domain
4. Follow Vercel's instructions to update your DNS settings
5. Wait for DNS propagation (can take up to 48 hours)

### 4. Update CORS Settings in Render

To allow your custom domain to access the Render API:

1. Go to your Render dashboard
2. Select your backend service
3. Go to Environment settings
4. Add/update the CORS_ORIGIN environment variable to include your domain:
   ```
   https://yourdomain.com
   ```
   (You may need to use a comma-separated list if you have multiple domains)

### 5. Testing Your Production Deployment

1. Visit your custom domain
2. Open browser developer tools (F12)
3. Check the Console tab for any errors
4. Test authentication and API calls
5. Verify that all features are working correctly

### 6. Troubleshooting

If you encounter issues:

1. **CORS errors**: Make sure your domain is added to the CORS settings in Render
2. **API connection issues**: Verify the VITE_API_URL is set correctly in Vercel
3. **Authentication problems**: Check that Supabase credentials are correct
4. **Blank page**: Check for JavaScript errors in the browser console