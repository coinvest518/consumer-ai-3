# ConsumerAI Chat Data Flow

This document explains how chat data flows between the frontend and backend in the ConsumerAI application.

## Data Structure

### Chat Message Format

The frontend uses a consistent `ChatMessage` type:

```typescript
interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  created_at: string;
  timestamp?: number;
}
```

### Session Data

Sessions are used to group messages and track conversations:

```typescript
interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: string;
  messageCount: number;
  messages?: ChatMessage[];
}
```

## Authentication Flow

1. **User Authentication**:
   - The application uses Supabase for authentication
   - After login, the user ID is stored in localStorage/sessionStorage
   - The `getUserId()` function retrieves this ID for API requests

2. **User ID Handling**:
   - User ID is included in both request headers and request body:
   ```javascript
   headers: {
     'user-id': effectiveUserId,
     'Content-Type': 'application/json'
   },
   body: JSON.stringify({ message, sessionId, userId: effectiveUserId })
   ```

## Chat Flow

### Sending a Message

1. **User Input**:
   - User types a message in the `ChatInterface` component
   - The component calls `handleSubmit()` which calls `sendMessage()`

2. **Message Processing in useChat Hook**:
   ```typescript
   const sendMessage = useCallback(async (content: string) => {
     // Check for user ID
     if (!user?.id) {
       console.error('[useChat] No user ID available for sending message');
       setError('Please log in to send messages');
       return;
     }
     
     // Get or create session ID
     let sessionId = currentChatId;
     if (!sessionId) {
       // Create a new session if needed
       const sessionResponse = await api.createSession({ userId: user.id, sessionName: 'New Chat' });
       sessionId = sessionResponse.data.id;
     }
     
     // Add user message to local state immediately
     const userMessage = {
       id: `${Date.now()}-user`,
       content,
       role: 'user' as const,
       created_at: new Date().toISOString()
     };
     setMessages(prev => [...prev, userMessage]);
     
     // Send message to API
     const response = await api.sendMessage(content, sessionId, user.id);
     
     // Add AI response to local state
     if (response.data) {
       const aiMessage = {
         id: response.data.id || `${Date.now()}-ai`,
         content: response.data.content || response.data.message,
         role: 'assistant' as const,
         created_at: response.data.created_at || new Date().toISOString()
       };
       setMessages(prev => [...prev, aiMessage]);
     }
   }, [user?.id, currentChatId, api]);
   ```

3. **API Request in enhanced-api.ts**:
   ```javascript
   sendMessage: async (message: string, sessionId: string, userId?: string) => {
     const effectiveUserId = userId || getUserId();
     
     // Validation
     if (!message || !sessionId || !effectiveUserId) {
       throw new Error('Missing required parameters');
     }
     
     // Make API request
     const response = await fetchAPI('chat', {
       method: 'POST',
       headers: {
         'user-id': effectiveUserId,
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({ message, sessionId, userId: effectiveUserId }),
     });
     
     return response;
   }
   ```

4. **Backend Processing**:
   - The backend receives the request at `/api/chat`
   - It extracts the message, sessionId, and userId
   - It processes the message using the OpenAI API
   - It stores the message and response in Supabase
   - It returns the AI response

### Loading Chat History

1. **Initial Load**:
   - When the component mounts, it calls `loadChatById()` or loads default chat
   - If no chat ID is provided, it loads chat history for the current user

2. **API Request**:
   ```javascript
   getChatHistory: async (userId?: string) => {
     const effectiveUserId = userId || getUserId();
     
     if (!effectiveUserId) {
       throw new Error('Missing userId for getChatHistory');
     }
     
     const response = await fetchAPI('chat/history', {
       headers: {
         'user-id': effectiveUserId,
         'Content-Type': 'application/json'
       },
     });
     
     return response;
   }
   ```

3. **Backend Processing**:
   - The backend fetches chat history from Supabase
   - It transforms the data to match the frontend format
   - It returns the chat history as an array

4. **Frontend Processing**:
   ```typescript
   if (response.data && Array.isArray(response.data) && response.data.length > 0) {
     // Transform backend messages to expected frontend format
     const transformed: ChatMessage[] = [];
     response.data.forEach((entry: any) => {
       if (entry.message || entry.text) {
         transformed.push({
           id: entry.id || `${entry.created_at}-user`,
           content: entry.message || entry.text,
           role: "user",
           created_at: entry.created_at,
         });
       }
       if (entry.response) {
         transformed.push({
           id: entry.id ? entry.id + "-ai" : `${entry.created_at}-ai`,
           content: entry.response,
           role: "assistant",
           created_at: entry.created_at,
         });
       }
     });
     setMessages(transformed);
   }
   ```

## Session Management

1. **Session Creation**:
   - When a user sends their first message, a session is created
   - The session ID is used for all subsequent messages

2. **API Request**:
   ```javascript
   createSession: async (data: { userId?: string, email?: string, sessionName?: string }) => {
     const effectiveUserId = data.userId || getUserId();
     
     if (!effectiveUserId) {
       throw new Error('Missing userId for createSession');
     }
     
     const response = await fetchAPI('session', {
       method: 'POST',
       headers: {
         'user-id': effectiveUserId,
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({ 
         userId: effectiveUserId, 
         email: data.email,
         sessionName: data.sessionName || 'New Chat'
       }),
     });
     
     return response;
   }
   ```

3. **Backend Processing**:
   - The backend creates a new session in Supabase
   - It returns the session data including the session ID

## Key Insights

1. **User ID Handling**:
   - The user ID is retrieved from Supabase auth storage
   - It's included in both headers and request body
   - The backend validates the user ID for most endpoints

2. **Session ID Handling**:
   - The session ID is created when the user sends their first message
   - It's used to group messages together
   - The backend uses it to retrieve and store messages

3. **Message Format Transformation**:
   - The frontend and backend use slightly different message formats
   - The frontend transforms backend responses to match its expected format
   - The key fields are `id`, `content`, `role`, and `created_at`

4. **Error Handling**:
   - The frontend checks for required fields before sending requests
   - The backend validates input and returns appropriate error responses
   - Error messages are displayed to the user in the chat interface

5. **Data Flow**:
   - User input → ChatInterface → useChat hook → enhanced-api.ts → backend → database
   - Database → backend → enhanced-api.ts → useChat hook → ChatInterface → user display