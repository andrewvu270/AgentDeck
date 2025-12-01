import { LLMProvider, LLMRequest, LLMResponse } from './types';
export declare class OpenAIAdapter implements LLMProvider {
    name: string;
    call(apiKey: string, request: LLMRequest): Promise<LLMResponse>;
    calculateCost(model: string, tokensUsed: number): number;
}
declare const _default: OpenAIAdapter;
export default _default;
//# sourceMappingURL=openai.adapter.d.ts.map