# Simple Chatbot with ElevenLabs Voice Setup

## Overview
Replaced the expensive Tavus video chat with a simple text-based chatbot that includes:
- Text-based chat interface
- Speech-to-text input (browser native)
- Text-to-speech output (ElevenLabs)
- Mobile-responsive design
- Floating chat button

## Required Environment Variables

Add these to your `.env` file:

```env
# ElevenLabs Text-to-Speech API
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# OpenAI for chat responses (already configured)
OPENAI_API_KEY=your_openai_api_key_here
```

## Getting ElevenLabs API Key

1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Sign up for a free account (10,000 characters/month free)
3. Go to Profile → API Keys
4. Generate a new API key
5. Add it to your `.env` file

## Features

### Chat Interface
- Clean, modern chat UI
- Floating chat button (bottom-right)
- Mobile-responsive design
- Real-time typing indicators

### Voice Features
- **Speech Input**: Click microphone to speak your message
- **Voice Output**: AI responses are spoken using ElevenLabs
- **Voice Toggle**: Users can enable/disable voice output
- **Voice Selection**: Uses "Bella" voice (friendly female)

### Cost Comparison
- **Tavus**: ~$0.50-1.00 per minute of video chat
- **ElevenLabs**: ~$0.18 per 1000 characters (much cheaper)
- **OpenAI**: ~$0.002 per 1000 tokens

## Files Changed

### New Files
- `src/components/SimpleChatbot.tsx` - New chatbot component
- `api/chat.ts` - OpenAI chat endpoint
- `api/text-to-speech.ts` - ElevenLabs TTS endpoint

### Updated Files
- `src/pages/Landing.tsx` - Uses SimpleChatbot
- `src/pages/Home.tsx` - Uses SimpleChatbot  
- `src/pages/EnhancedDashboard.tsx` - Uses SimpleChatbot
- `src/env.d.ts` - Added Speech Recognition types
- `vercel.json` - Updated API routes
- `.env` - Removed Tavus vars, added ElevenLabs

### Removed Files
- `src/components/TavusChatbot.tsx` - Old video chat component
- `api/conversations.ts` - Tavus API endpoint

## Usage

1. Users click the floating chat button
2. Chat modal opens with welcome message
3. Users can type or speak their questions
4. AI responds with text and optional voice
5. Voice can be toggled on/off

## Customization

### Change Voice
Edit `api/text-to-speech.ts`:
```typescript
voice_id: 'EXAVITQu4vr4xnSDxMaL' // Bella (default)
// Other options:
// 'pNInz6obpgDQGcFmaJgB' // Adam (male)
// '21m00Tcm4TlvDq8ikWAM' // Rachel (female)
```

### Modify Chat Behavior
Edit the system prompt in `api/chat.ts` or pass custom prompts from the frontend.

### Styling
The component uses Tailwind CSS and can be customized via className props.

## Testing

1. Start development server: `npm run dev`
2. Click the floating chat button
3. Test text input and speech recognition
4. Verify voice output works (requires ElevenLabs API key)

## Deployment

The chatbot will work automatically on Vercel with the updated configuration. Make sure to add the `ELEVENLABS_API_KEY` environment variable in your Vercel dashboard.