# ConsumerAI

A mobile-first legal AI assistant for consumer law questions with an animated landing page and simple chat interface.

## Features

- Interactive, animated landing page
- Simple chat interface for legal questions
- AI responses with legal citations and suggested actions
- Information on FCRA, FDCPA, and consumer protection laws
- Responsive design for optimal mobile experience

## Tech Stack

- React with Typescript
- Framer Motion for animations
- Tailwind CSS for styling
- Express backend for API
- Shadcn UI components

## Installation

```bash
# Clone the repository
git clone https://github.com/coinvest518/consumer-Ai-chat.git

# Navigate to the project directory
cd consumer-Ai-chat

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Usage

1. Visit the landing page to learn about ConsumerAI's features
2. Navigate to the chat interface by clicking "Start Chatting"
3. Ask questions about consumer law, credit reports, debt collection, etc.
4. Receive AI-powered responses with legal citations and suggested next steps

## Testing Different Backends

For local development, you can test with different backends by temporarily modifying the API URL in your code:

```typescript
// In src/lib/api.ts
// Change this line for local testing
const RENDER_API_URL = "http://localhost:3001/api";

// Then change it back for production before committing
// const RENDER_API_URL = "https://consumer-ai-render.onrender.com/api";
```

**Note:** Always revert any changes before committing to ensure the production deployment works correctly.

## License

MIT