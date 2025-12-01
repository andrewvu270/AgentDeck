import { CollaborationMode } from './workspace.service';
export interface AgentContext {
    conversationId: string;
    messages: any[];
    currentRound: number;
    remainingTokens: number;
    mode: CollaborationMode;
    userPrompt: string;
    agentInstructions: string;
}
export declare class OrchestratorService {
    /**
     * Build context for agent invocation
     */
    buildAgentContext(conversationId: string, agentId: string, userId: string): Promise<AgentContext>;
    /**
     * Start collaboration session
     */
    startCollaboration(userId: string, conversationId: string, mode: CollaborationMode): Promise<void>;
    /**
     * Invoke a single agent
     */
    invokeAgent(conversationId: string, agentId: string, userId: string): Promise<void>;
    /**
     * Enforce token budget
     */
    enforceTokenBudget(conversationId: string, userId: string): Promise<boolean>;
}
declare const _default: OrchestratorService;
export default _default;
//# sourceMappingURL=orchestrator.service.d.ts.map