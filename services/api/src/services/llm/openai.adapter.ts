import OpenAI from 'openai';
import { LLMProvider, LLMRequest, LLMResponse } from './types';

export class OpenAIAdapter implements LLMProvider {
  name = 'openai';
  
  async call(apiKey: string, request: LLMRequest): Promise<LLMResponse> {
    const client = new OpenAI({ apiKey });
    
    const response = await client.chat.completions.create({
      model: request.model,
      messages: request.messages as any,
      tools: request.tools?.map((t) => ({
        type: 'function' as const,
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      })),
      temperature: request.temperature,
      max_tokens: request.max_tokens,
    });
    
    const choice = response.choices[0];
    const toolCalls = choice.message.tool_calls?.map((tc) => ({
      id: tc.id,
      name: tc.function.name,
      arguments: JSON.parse(tc.function.arguments),
    }));
    
    return {
      content: choice.message.content || '',
      tool_calls: toolCalls,
      tokens_used: response.usage?.total_tokens || 0,
      finish_reason: choice.finish_reason,
    };
  }
  
  calculateCost(model: string, tokensUsed: number): number {
    const pricing: Record<string, number> = {
      'gpt-4o': 5.0 / 1_000_000,
      'gpt-4o-mini': 0.15 / 1_000_000,
      'gpt-4-turbo': 10.0 / 1_000_000,
      'gpt-4': 30.0 / 1_000_000,
      'gpt-3.5-turbo': 0.5 / 1_000_000,
    };
    
    return (pricing[model] || 0) * tokensUsed;
  }
}

export default new OpenAIAdapter();
