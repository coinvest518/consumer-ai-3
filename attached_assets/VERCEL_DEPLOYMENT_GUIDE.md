# Vercel Deployment Guide for ConsumerAI

This guide will walk you through deploying your ConsumerAI application to Vercel using GitHub integration.

## Prerequisites

1. A GitHub account
2. A Vercel account (sign up at https://vercel.com)
3. Your ConsumerAI project pushed to a GitHub repository

## Step 1: Push Your Code to GitHub

1. Create a new GitHub repository (if you haven't already)
2. Initialize Git in your project folder (if not already initialized):
   ```bash
   git init
   ```
3. Add all files to Git:
   ```bash
   git add .
   ```
4. Commit the changes:
   ```bash
   git commit -m "Initial commit for Vercel deployment"
   ```
5. Add your GitHub repository as a remote:
   ```bash
   git remote add origin https://github.com/yourusername/consumer-Ai-chat.git
   ```
6. Push your code to GitHub:
   ```bash
   git push -u origin main
   ```

## Step 2: Set Up Environment Variables in Vercel

Before deploying, you need to set up your environment variables in Vercel:

1. Log in to your Vercel account
2. Go to your dashboard and click "Add New" > "Project"
3. Import your GitHub repository
4. In the project settings, go to the "Environment Variables" tab
5. Add all the necessary environment variables from your `.env` file:

Required environment variables:
- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_KEY` (anon key)
- `ASTRA_DB_APPLICATION_TOKEN` (if using Astra DB)
- `ASTRA_DB_ENDPOINT` (if using Astra DB)
- `STRIPE_SECRET_KEY` (if using Stripe)
- `STRIPE_PUBLISHABLE_KEY` (if using Stripe)
- `STRIPE_PRICE_ID` (if using Stripe)

Frontend-specific variables (with VITE_ prefix):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL` (set to your production domain + "/api", e.g., "https://yourdomain.com/api")
- `VITE_PUBLIC_URL` (set to your production domain, e.g., "https://yourdomain.com")

## Step 3: Configure Your Domain

1. In your Vercel project settings, go to the "Domains" tab
2. Add your custom domain and follow the verification steps
3. Update the following environment variables to use your custom domain:
   - `VITE_API_BASE_URL` = "https://yourdomain.com/api"
   - `VITE_PUBLIC_URL` = "https://yourdomain.com"
   - `STRIPE_SUCCESS_URL` = "https://yourdomain.com/thank-you"
   - `STRIPE_CANCEL_URL` = "https://yourdomain.com/pricing"

## Step 4: Deploy to Vercel

1. In your Vercel project dashboard, click "Deploy"
2. Vercel will automatically build and deploy your application
3. Once deployed, you can access your application at your custom domain or the Vercel-provided URL

## Troubleshooting

If you encounter any issues during deployment:

1. Check the build logs in Vercel for errors
2. Verify that all environment variables are correctly set
3. Make sure your `vercel.json` configuration is correct
4. Check that your API routes are properly configured

## Monitoring and Maintenance

After deployment:

1. Monitor your application's performance in the Vercel dashboard
2. Set up logging and error tracking
3. Configure automatic deployments for future updates

## Additional Notes

- The application uses Vercel Serverless Functions for the API endpoints
- The frontend is built with Vite and served as static files
- Make sure your Supabase and other service configurations are set up for production use