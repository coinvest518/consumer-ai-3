# Chat Flow and API Integration

This document explains how the chat functionality works in ConsumerAI, including the API integration and chat history flow.

## Chat Flow

1. **User Authentication**:
   - User logs in using Supabase authentication
   - Authentication state is managed in `AuthContext.tsx`
   - User ID is stored and used for API requests

2. **Chat History Loading**:
   - When a user navigates to the chat page, the `useChat` hook automatically loads their chat history
   - The hook makes a request to `/api/chat/history` with the user's ID
   - This request is routed to the Render backend via Vercel
   - The backend queries Supabase for the user's chat history
   - Chat history is displayed to the user

3. **Sending Messages**:
   - User types a message and clicks send
   - The `sendMessage` function in the `useChat` hook is called
   - If no session exists, a new session is created
   - The message is sent to the backend via the `/api/chat` endpoint
   - The backend processes the message using LangChain and OpenAI
   - The response is returned to the frontend and displayed to the user

4. **Agent Simulation**:
   - The frontend simulates agent actions with timeouts
   - This provides visual feedback to the user while waiting for the AI response
   - The backend processes the message and returns the response

## API Integration

1. **Frontend API Client**:
   - Located in `src/lib/api.ts`
   - Uses `fetch` to make requests to the backend
   - Adds headers and handles errors
   - Provides methods for different API endpoints

2. **Vercel Routing**:
   - Configured in `vercel.json`
   - Routes API requests to the Render backend
   - Example: `/api/chat/history` → `https://consumer-ai-render.onrender.com/api/chat/history`

3. **Backend API Handler**:
   - Located in the Render backend
   - Processes requests based on the path
   - Interacts with Supabase for data storage
   - Uses LangChain and OpenAI for AI responses

## Supabase Integration

1. **Chat History Storage**:
   - Chat history is stored in Supabase
   - Each message is associated with a user ID
   - The backend queries Supabase for chat history

2. **User Profiles**:
   - User profiles are stored in Supabase
   - Contains information like message limits and subscription status
   - Used to determine if a user can send more messages

## Troubleshooting

If you encounter issues with the chat functionality:

1. Check the browser console for errors
2. Verify that the API requests are being made to the correct endpoints
3. Ensure that the user ID is being passed correctly
4. Check that the Vercel routing is configured correctly
5. Verify that the backend is running and accessible
6. Check that Supabase is accessible and contains the expected data