export type TierName = 'free' | 'starter' | 'professional' | 'enterprise';
export type AdvisorLevel = 'none' | 'basic' | 'advanced' | 'full';
export type AnalyticsLevel = 'basic' | 'standard' | 'advanced' | 'custom';
export type ResourceType = 'agents' | 'event_hooks' | 'collaboration_tables' | 'tokens' | 'memory';
export interface Tier {
    id: string;
    name: TierName;
    display_name: string;
    description: string;
    max_agents: number;
    available_roles: string[];
    max_event_hooks: number;
    max_collaboration_tables: number;
    advisor_agent_level: AdvisorLevel;
    memory_size_bytes: number;
    analytics_level: AnalyticsLevel;
    token_budget_monthly: number;
    price_monthly_usd: number;
    created_at: Date;
    updated_at: Date;
}
export interface UserTierUsage {
    id: string;
    user_id: string;
    agents_count: number;
    event_hooks_count: number;
    collaboration_tables_active: number;
    memory_used_bytes: number;
    tokens_used_monthly: number;
    last_reset_at: Date;
    created_at: Date;
    updated_at: Date;
}
export interface TierLimits {
    tier: Tier;
    usage: UserTierUsage;
    limits: {
        agents: {
            current: number;
            max: number;
            percentage: number;
        };
        event_hooks: {
            current: number;
            max: number;
            percentage: number;
        };
        collaboration_tables: {
            current: number;
            max: number;
            percentage: number;
        };
        memory: {
            current: number;
            max: number;
            percentage: number;
        };
        tokens: {
            current: number;
            max: number;
            percentage: number;
        };
    };
}
export declare class TierService {
    /**
     * Get tier by name
     */
    getTierByName(tierName: TierName): Promise<Tier | null>;
    /**
     * Get all available tiers
     */
    getAllTiers(): Promise<Tier[]>;
    /**
     * Get user's current tier
     */
    getUserTier(userId: string): Promise<Tier>;
    /**
     * Get user's tier usage
     */
    getUserTierUsage(userId: string): Promise<UserTierUsage>;
    /**
     * Get complete tier limits and usage for user
     */
    getTierLimits(userId: string): Promise<TierLimits>;
    /**
     * Check if user can perform an action (create agent, add event hook, etc.)
     */
    canPerformAction(userId: string, resourceType: ResourceType): Promise<boolean>;
    /**
     * Track usage for a resource
     */
    trackUsage(userId: string, resourceType: ResourceType, delta: number): Promise<void>;
    /**
     * Increment usage counter (convenience method)
     */
    incrementUsage(userId: string, resourceType: ResourceType): Promise<void>;
    /**
     * Decrement usage counter (convenience method)
     */
    decrementUsage(userId: string, resourceType: ResourceType): Promise<void>;
    /**
     * Check if user has access to a specific role
     */
    hasRoleAccess(userId: string, roleType: string): Promise<boolean>;
    /**
     * Check if user has advisor agent access
     */
    hasAdvisorAccess(userId: string): Promise<boolean>;
    /**
     * Get advisor agent level for user
     */
    getAdvisorLevel(userId: string): Promise<AdvisorLevel>;
    /**
     * Upgrade user to a new tier
     */
    upgradeTier(userId: string, newTierName: TierName): Promise<void>;
    /**
     * Reset monthly usage counters (called by scheduled job)
     */
    resetMonthlyUsage(userId: string): Promise<void>;
    /**
     * Get usage history for analytics
     */
    getUsageHistory(userId: string, resourceType?: ResourceType, limit?: number): Promise<any[]>;
    /**
     * Check if action would exceed limits and throw error if so
     */
    enforceLimit(userId: string, resourceType: ResourceType): Promise<void>;
}
declare const _default: TierService;
export default _default;
//# sourceMappingURL=tier.service.d.ts.map