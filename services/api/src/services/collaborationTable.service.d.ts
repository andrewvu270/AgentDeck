export type CollaborationPhase = 'data_gathering' | 'analysis' | 'debate' | 'recommendation';
export type TableStatus = 'active' | 'paused' | 'completed' | 'cancelled';
export interface CollaborationTable {
    id: string;
    user_id: string;
    name: string;
    topic: string;
    desired_outcome: string;
    participating_agents: string[];
    current_phase: CollaborationPhase;
    token_budget: number;
    time_limit_minutes?: number;
    status: TableStatus;
    conversation_id?: string;
    output_summary?: string;
    output_recommendations?: any[];
    output_action_items?: any[];
    output_dissenting_opinions?: any[];
    created_at: Date;
    completed_at?: Date;
}
export interface CreateTableInput {
    name: string;
    topic: string;
    desired_outcome: string;
    participating_agents: string[];
    token_budget?: number;
    time_limit_minutes?: number;
}
export declare class CollaborationTableService {
    /**
     * Create a new collaboration table
     */
    createTable(userId: string, input: CreateTableInput): Promise<CollaborationTable>;
    /**
     * Get table by ID
     */
    getTable(tableId: string, userId: string): Promise<CollaborationTable>;
    /**
     * Advance to next phase
     */
    advancePhase(tableId: string, userId: string): Promise<CollaborationTable>;
    /**
     * Complete a table with output
     */
    completeTable(tableId: string, userId: string): Promise<CollaborationTable>;
    /**
     * Update table output
     */
    updateOutput(tableId: string, userId: string, output: {
        summary?: string;
        recommendations?: any[];
        action_items?: any[];
        dissenting_opinions?: any[];
    }): Promise<void>;
    /**
     * List tables for user
     */
    listTables(userId: string, status?: TableStatus): Promise<CollaborationTable[]>;
    /**
     * Get phase instructions for agents
     */
    getPhaseInstructions(phase: CollaborationPhase): string;
}
declare const _default: CollaborationTableService;
export default _default;
//# sourceMappingURL=collaborationTable.service.d.ts.map