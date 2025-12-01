"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestratorService = void 0;
const workspace_service_1 = __importDefault(require("./workspace.service"));
const agent_service_1 = __importDefault(require("./agent.service"));
class OrchestratorService {
    /**
     * Build context for agent invocation
     */
    async buildAgentContext(conversationId, agentId, userId) {
        // Get conversation
        const conversation = await workspace_service_1.default.getConversation(conversationId, userId);
        // Get messages
        const messages = await workspace_service_1.default.getConversationHistory(conversationId, userId);
        // Get agent
        const agent = await agent_service_1.default.get(agentId, userId);
        // Build instructions based on mode and role
        let instructions = agent.system_prompt;
        if (agent.role_type) {
            instructions += `\n\nYour role: ${agent.role_responsibilities}`;
        }
        // Add mode-specific instructions
        if (conversation.mode === 'debate') {
            instructions += '\n\nYou are in debate mode. Challenge opposing viewpoints constructively.';
        }
        else if (conversation.mode === 'brainstorm') {
            instructions += '\n\nYou are in brainstorm mode. Build on others\' ideas creatively.';
        }
        return {
            conversationId,
            messages: messages.map((m) => ({
                role: m.sender_type === 'user' ? 'user' : 'assistant',
                content: `[${m.sender_name}]: ${m.content}`,
            })),
            currentRound: Math.floor(conversation.message_count / conversation.participating_agents.length),
            remainingTokens: conversation.token_budget - conversation.total_tokens,
            mode: conversation.mode,
            userPrompt: messages[0]?.content || '',
            agentInstructions: instructions,
        };
    }
    /**
     * Start collaboration session
     */
    async startCollaboration(userId, conversationId, mode) {
        const conversation = await workspace_service_1.default.getConversation(conversationId, userId);
        // Invoke agents based on mode
        if (mode === 'sequential') {
            // One after another
            for (const agentId of conversation.participating_agents) {
                await this.invokeAgent(conversationId, agentId, userId);
            }
        }
        else if (mode === 'parallel') {
            // All at once
            await Promise.all(conversation.participating_agents.map((agentId) => this.invokeAgent(conversationId, agentId, userId)));
        }
    }
    /**
     * Invoke a single agent
     */
    async invokeAgent(conversationId, agentId, userId) {
        // Build context
        const context = await this.buildAgentContext(conversationId, agentId, userId);
        // Check token budget
        if (context.remainingTokens <= 0) {
            await workspace_service_1.default.updateConversationStatus(conversationId, userId, 'paused');
            return;
        }
        // Get agent
        const agent = await agent_service_1.default.get(agentId, userId);
        // Placeholder for actual LLM invocation
        // In production, this would call OpenAI/Anthropic/etc.
        const response = {
            content: `[${agent.name}] Response placeholder`,
            tokens: 100,
        };
        // Add message to conversation
        await workspace_service_1.default.addMessage(conversationId, {
            sender_type: 'agent',
            sender_id: agentId,
            sender_name: agent.name,
            sender_role: agent.role_type,
            content: response.content,
            tokens: response.tokens,
        });
    }
    /**
     * Enforce token budget
     */
    async enforceTokenBudget(conversationId, userId) {
        const conversation = await workspace_service_1.default.getConversation(conversationId, userId);
        return conversation.total_tokens < conversation.token_budget;
    }
}
exports.OrchestratorService = OrchestratorService;
exports.default = new OrchestratorService();
//# sourceMappingURL=orchestrator.service.js.map