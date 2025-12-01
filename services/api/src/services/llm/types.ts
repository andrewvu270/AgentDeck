export interface LLMMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
}

export interface LLMToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
}

export interface LLMRequest {
  model: string;
  messages: LLMMessage[];
  tools?: LLMToolDefinition[];
  temperature?: number;
  max_tokens?: number;
}

export interface LLMResponse {
  content: string;
  tool_calls?: LLMToolCall[];
  tokens_used: number;
  finish_reason: string;
}

export interface LLMToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface LLMProvider {
  name: string;
  call(apiKey: string, request: LLMRequest): Promise<LLMResponse>;
  calculateCost(model: string, tokensUsed: number): number;
}
