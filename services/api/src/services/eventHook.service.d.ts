export type EventType = 'new_customer' | 'payment_failed' | 'churn_risk' | 'product_updated' | 'analytics_threshold' | 'calendar_event' | 'crm_change' | 'support_ticket' | 'inventory_low';
export interface EventSubscription {
    id: string;
    agent_id: string;
    event_type: EventType;
    filters: Record<string, any>;
    is_active: boolean;
    created_at: Date;
}
export interface BusinessEvent {
    id: string;
    user_id: string;
    event_type: EventType;
    source: string;
    data: Record<string, any>;
    metadata: Record<string, any>;
    triggered_agents: string[];
    created_at: Date;
}
export declare class EventHookService {
    /**
     * Subscribe an agent to an event type
     */
    subscribeAgent(userId: string, agentId: string, eventType: EventType, filters?: Record<string, any>): Promise<EventSubscription>;
    /**
     * Unsubscribe an agent from an event type
     */
    unsubscribeAgent(userId: string, agentId: string, eventType: EventType): Promise<void>;
    /**
     * Get all subscriptions for an agent
     */
    getAgentSubscriptions(agentId: string): Promise<EventSubscription[]>;
    /**
     * Get all agents subscribed to an event type
     */
    getSubscribedAgents(userId: string, eventType: EventType): Promise<string[]>;
    /**
     * Handle incoming event from external system
     */
    handleEvent(userId: string, eventType: EventType, source: string, data: Record<string, any>, metadata?: Record<string, any>): Promise<BusinessEvent>;
    /**
     * Get event history for user
     */
    getEventHistory(userId: string, eventType?: EventType, limit?: number): Promise<BusinessEvent[]>;
    /**
     * Track event response time
     */
    trackEventResponse(eventId: string, agentId: string, responseTime: number): Promise<void>;
    /**
     * Toggle subscription active status
     */
    toggleSubscription(userId: string, subscriptionId: string): Promise<void>;
}
declare const _default: EventHookService;
export default _default;
//# sourceMappingURL=eventHook.service.d.ts.map