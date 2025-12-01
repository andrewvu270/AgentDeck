export type CollaborationMode = 'sequential' | 'parallel' | 'debate' | 'brainstorm' | 'review';
export type ConversationStatus = 'active' | 'paused' | 'completed' | 'archived';
export type MessageType = 'normal' | 'status' | 'insight' | 'error' | 'question' | 'recommendation';
export interface Conversation {
    id: string;
    user_id: string;
    name?: string;
    mode: CollaborationMode;
    max_rounds: number;
    token_budget: number;
    participating_agents: string[];
    total_tokens: number;
    total_cost: number;
    message_count: number;
    tool_call_count: number;
    status: ConversationStatus;
    created_at: Date;
    updated_at: Date;
    archived_at?: Date;
}
export interface Message {
    id: string;
    conversation_id: string;
    sender_type: 'user' | 'agent' | 'system';
    sender_id: string;
    sender_name: string;
    sender_role?: string;
    content: string;
    message_type: MessageType;
    tokens: number;
    response_time?: number;
    mentions?: string[];
    reply_to?: string;
    created_at: Date;
}
export interface CreateConversationInput {
    name?: string;
    mode: CollaborationMode;
    max_rounds?: number;
    token_budget?: number;
    participating_agents: string[];
}
export interface CreateMessageInput {
    sender_type: 'user' | 'agent' | 'system';
    sender_id: string;
    sender_name: string;
    sender_role?: string;
    content: string;
    message_type?: MessageType;
    tokens?: number;
    response_time?: number;
    mentions?: string[];
    reply_to?: string;
}
export declare class WorkspaceService {
    /**
     * Create a new conversation
     */
    createConversation(userId: string, input: CreateConversationInput): Promise<Conversation>;
    /**
     * Add a message to a conversation
     */
    addMessage(conversationId: string, input: CreateMessageInput): Promise<Message>;
    /**
     * Get conversation by ID
     */
    getConversation(conversationId: string, userId: string): Promise<Conversation>;
    /**
     * Get conversation history (messages)
     */
    getConversationHistory(conversationId: string, userId: string, limit?: number): Promise<Message[]>;
    /**
     * List conversations for user
     */
    listConversations(userId: string, status?: ConversationStatus, limit?: number): Promise<Conversation[]>;
    /**
     * Archive a conversation
     */
    archiveConversation(conversationId: string, userId: string): Promise<void>;
    /**
     * Reopen an archived conversation
     */
    reopenConversation(conversationId: string, userId: string): Promise<void>;
    /**
     * Search messages across conversations
     */
    searchMessages(userId: string, searchTerm: string, limit?: number): Promise<Message[]>;
    /**
     * Filter messages by criteria
     */
    filterMessages(userId: string, filters: {
        conversationId?: string;
        senderType?: 'user' | 'agent' | 'system';
        messageType?: MessageType;
        dateFrom?: Date;
        dateTo?: Date;
    }, limit?: number): Promise<Message[]>;
    /**
     * Update conversation status
     */
    updateConversationStatus(conversationId: string, userId: string, status: ConversationStatus): Promise<void>;
    /**
     * Get messages with mentions for a user
     */
    getMentions(userId: string, limit?: number): Promise<Message[]>;
    /**
     * Export conversation to JSON
     */
    exportConversation(conversationId: string, userId: string): Promise<any>;
}
declare const _default: WorkspaceService;
export default _default;
//# sourceMappingURL=workspace.service.d.ts.map