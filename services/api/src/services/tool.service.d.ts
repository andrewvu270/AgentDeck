export type ToolType = 'rest_api' | 'database' | 'crm' | 'web_search' | 'custom';
export interface Tool {
    id: string;
    user_id: string;
    name: string;
    description: string;
    parameters: Record<string, any>;
    handler_type: ToolType;
    handler_config: Record<string, any>;
    timeout_ms: number;
    created_at: Date;
}
export interface ToolCall {
    id: string;
    message_id: string;
    tool_id: string;
    tool_name: string;
    parameters: Record<string, any>;
    response_data?: any;
    status: 'pending' | 'running' | 'success' | 'error';
    duration?: number;
    error?: string;
    created_at: Date;
}
export declare class ToolService {
    private encryptionKey;
    constructor();
    /**
     * Encrypt sensitive data (API keys, credentials)
     */
    private encrypt;
    /**
     * Decrypt sensitive data
     */
    private decrypt;
    /**
     * Register a new tool
     */
    registerTool(userId: string, name: string, description: string, handlerType: ToolType, handlerConfig: Record<string, any>, parameters?: Record<string, any>): Promise<Tool>;
    /**
     * Execute a tool
     */
    executeTool(toolId: string, parameters: Record<string, any>): Promise<{
        data: any;
        duration: number;
    }>;
    /**
     * Execute REST API tool
     */
    private executeRestAPI;
    /**
     * Execute database query tool
     */
    private executeDatabaseQuery;
    /**
     * Execute CRM query tool
     */
    private executeCRMQuery;
    /**
     * Execute web search tool
     */
    private executeWebSearch;
    /**
     * Execute custom tool
     */
    private executeCustom;
    /**
     * Create a tool call record
     */
    createToolCall(messageId: string, toolId: string, toolName: string, parameters: Record<string, any>): Promise<ToolCall>;
    /**
     * Update tool call with results
     */
    updateToolCall(toolCallId: string, status: 'success' | 'error', responseData?: any, duration?: number, error?: string): Promise<void>;
    /**
     * Get tool calls for a message
     */
    getMessageToolCalls(messageId: string): Promise<ToolCall[]>;
    /**
     * Get tools for an agent
     */
    getAgentTools(agentId: string): Promise<Tool[]>;
    /**
     * Validate tool access for agent
     */
    validateToolAccess(agentId: string, toolId: string): Promise<boolean>;
}
declare const _default: ToolService;
export default _default;
//# sourceMappingURL=tool.service.d.ts.map