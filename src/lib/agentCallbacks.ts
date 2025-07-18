import { BaseCallbackHandler } from '@langchain/core/callbacks/base';
import { AgentAction, AgentFinish } from '@langchain/core/agents';
import { ChainValues } from '@langchain/core/utils/types';
import { Serialized } from '@langchain/core/load/serializable';

export interface AgentEvent {
  type: 'tool_start' | 'tool_end' | 'agent_action' | 'agent_finish' | 'thinking' | 'error' | 'text';
  name?: string;
  content?: string;
  data?: any;
  timestamp: number;
}

export interface StreamCallbacks {
  onEvent: (event: AgentEvent) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Callback handler for streaming agent actions to the frontend
 */
export class StreamingAgentCallbackHandler extends BaseCallbackHandler {
  name = "streaming_agent_handler";
  
  private callbacks: StreamCallbacks;
  
  constructor(callbacks: StreamCallbacks) {
    super();
    this.callbacks = callbacks;
  }

  async handleAgentAction(action: AgentAction): Promise<void> {
    this.callbacks.onEvent({
      type: 'agent_action',
      name: action.tool,
      content: action.toolInput as string,
      data: action,
      timestamp: Date.now()
    });
  }

  // Updated signature to match BaseCallbackHandler
  async handleToolStart(
    tool: Serialized, 
    input: string, 
    runId: string, 
    parentRunId?: string, 
    tags?: string[], 
    metadata?: Record<string, unknown>
  ): Promise<void> {
    this.callbacks.onEvent({
      type: 'tool_start',
      name: typeof tool.name === 'string' ? tool.name : 'unknown-tool',
      content: input,
      timestamp: Date.now()
    });
  }

  // Updated signature to match BaseCallbackHandler
  async handleToolEnd(
    output: string, 
    runId: string, 
    parentRunId?: string, 
    tags?: string[]
  ): Promise<void> {
    this.callbacks.onEvent({
      type: 'tool_end',
      content: output,
      data: { runId },
      timestamp: Date.now()
    });
  }

  async handleAgentEnd(action: AgentFinish): Promise<void> {
    this.callbacks.onEvent({
      type: 'agent_finish',
      content: action.returnValues.output,
      data: action,
      timestamp: Date.now()
    });
  }

  async handleLLMStart(): Promise<void> {
    this.callbacks.onEvent({
      type: 'thinking',
      content: 'Thinking...',
      timestamp: Date.now()
    });
  }

  async handleLLMError(error: Error): Promise<void> {
    this.callbacks.onEvent({
      type: 'error',
      content: error.message,
      timestamp: Date.now()
    });
    
    if (this.callbacks.onError) {
      this.callbacks.onError(error);
    }
  }

  async handleChainEnd(outputs: ChainValues): Promise<void> {
    if (this.callbacks.onComplete) {
      this.callbacks.onComplete();
    }
  }

  async handleText(text: string): Promise<void> {
    this.callbacks.onEvent({
      type: 'text',
      content: text,
      timestamp: Date.now()
    });
  }
}

/**
 * Create a streaming callback handler for LangChain
 */
export function createStreamingCallbacks(callbacks: StreamCallbacks): StreamingAgentCallbackHandler {
  return new StreamingAgentCallbackHandler(callbacks);
}