# Agent Activity Display

This feature shows real-time agent actions in the chat interface, similar to Manu AI's platform.

## Implementation Details

We've implemented a simulated agent activity display that shows what the AI is doing in real-time. This creates a more engaging user experience by providing visibility into the AI's thought process.

### Key Components

1. **AgentActionDisplay**: A component that shows agent actions in real-time
2. **useChat Hook**: Enhanced to track agent state and simulate tool usage
3. **ChatInterface**: Updated to show agent activity with a toggle button

### How It Works

When a user sends a message:

1. The `useChat` hook sets `agentState.isActive` to true
2. It simulates agent actions with timeouts:
   - Database search
   - Knowledge base lookup
   - Response formulation
3. These actions appear in the chat interface in real-time
4. When the response is complete, `agentState.isActive` is set to false

### Visual Enhancements

- Color-coded icons for different tool types
- Animated appearance of new events
- Pulse animation for the agent activity container
- Clean, card-based design for each action

## Usage

The agent activity display is enabled by default. Users can toggle it on/off using the "Hide Activity" / "Show Activity" button in the chat header.

## Example Queries

For the best experience, try queries that would require multiple tools:

- "What are my rights regarding debt collection?"
- "How can I dispute errors on my credit report?"
- "What protections do I have against identity theft?"