export type AgentRole = 'sales' | 'marketing' | 'cx' | 'data' | 'strategy' | 'operations' | 'product' | 'cto';
export type AgentStatus = 'online' | 'busy' | 'idle' | 'error';
export interface Agent {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    model: string;
    provider: string;
    system_prompt: string;
    tools: string[];
    config: Record<string, any>;
    version: number;
    role_type?: AgentRole;
    role_responsibilities?: string;
    role_avatar_color?: string;
    event_subscriptions?: string[];
    status: AgentStatus;
    is_advisor: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface RoleTemplate {
    id: string;
    role_type: AgentRole;
    display_name: string;
    description: string;
    default_system_prompt: string;
    default_responsibilities: string;
    default_avatar_color: string;
    suggested_tools: string[];
    suggested_event_types: string[];
    created_at: Date;
}
export interface CreateAgentInput {
    name: string;
    description?: string;
    model: string;
    provider: string;
    system_prompt: string;
    tools?: string[];
    config?: Record<string, any>;
    role_type?: AgentRole;
    role_responsibilities?: string;
    role_avatar_color?: string;
    event_subscriptions?: string[];
    is_advisor?: boolean;
}
export declare class AgentService {
    /**
     * Get role template by role type
     */
    getRoleTemplate(roleType: AgentRole): Promise<RoleTemplate | null>;
    /**
     * Get all available role templates
     */
    getAllRoleTemplates(): Promise<RoleTemplate[]>;
    /**
     * Apply role template defaults to agent input
     */
    applyRoleDefaults(input: CreateAgentInput): Promise<CreateAgentInput>;
    create(userId: string, input: CreateAgentInput): Promise<Agent>;
    update(agentId: string, userId: string, input: Partial<CreateAgentInput>): Promise<Agent>;
    /**
     * Update agent status
     */
    updateStatus(agentId: string, userId: string, status: AgentStatus): Promise<void>;
    /**
     * Get agents by role type
     */
    getByRole(userId: string, roleType: AgentRole): Promise<Agent[]>;
    /**
     * Get advisor agent for user
     */
    getAdvisorAgent(userId: string): Promise<Agent | null>;
    delete(agentId: string, userId: string): Promise<void>;
    get(agentId: string, userId: string): Promise<Agent>;
    list(userId: string): Promise<Agent[]>;
    rollback(agentId: string, userId: string, version: number): Promise<Agent>;
}
declare const _default: AgentService;
export default _default;
//# sourceMappingURL=agent.service.d.ts.map