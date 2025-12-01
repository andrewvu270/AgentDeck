export interface Execution {
    id: string;
    agent_id: string;
    user_id: string;
    input: string;
    output?: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    tokens_used: number;
    cost_usd: number;
    latency_ms: number;
    tools_called: any[];
    error?: any;
    trace: any;
    created_at: Date;
    completed_at?: Date;
}
export declare class ExecutionService {
    execute(agentId: string, userId: string, input: string): Promise<Execution>;
    get(executionId: string, userId: string): Promise<Execution>;
    list(userId: string, agentId?: string): Promise<Execution[]>;
}
declare const _default: ExecutionService;
export default _default;
//# sourceMappingURL=execution.service.d.ts.map