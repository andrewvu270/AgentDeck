"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TierService = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
class TierService {
    /**
     * Get tier by name
     */
    async getTierByName(tierName) {
        const result = await (0, database_1.query)('SELECT * FROM tiers WHERE name = $1', [tierName]);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    }
    /**
     * Get all available tiers
     */
    async getAllTiers() {
        const result = await (0, database_1.query)('SELECT * FROM tiers ORDER BY price_monthly_usd ASC');
        return result.rows;
    }
    /**
     * Get user's current tier
     */
    async getUserTier(userId) {
        const result = await (0, database_1.query)(`SELECT t.* FROM tiers t
       JOIN users u ON u.tier_id = t.id
       WHERE u.id = $1`, [userId]);
        if (result.rows.length === 0) {
            throw new errorHandler_1.AppError(404, 'TIER_NOT_FOUND', 'User tier not found');
        }
        return result.rows[0];
    }
    /**
     * Get user's tier usage
     */
    async getUserTierUsage(userId) {
        const result = await (0, database_1.query)('SELECT * FROM user_tier_usage WHERE user_id = $1', [userId]);
        if (result.rows.length === 0) {
            // Create usage record if it doesn't exist
            const createResult = await (0, database_1.query)('INSERT INTO user_tier_usage (user_id) VALUES ($1) RETURNING *', [userId]);
            return createResult.rows[0];
        }
        return result.rows[0];
    }
    /**
     * Get complete tier limits and usage for user
     */
    async getTierLimits(userId) {
        const tier = await this.getUserTier(userId);
        const usage = await this.getUserTierUsage(userId);
        return {
            tier,
            usage,
            limits: {
                agents: {
                    current: usage.agents_count,
                    max: tier.max_agents,
                    percentage: (usage.agents_count / tier.max_agents) * 100,
                },
                event_hooks: {
                    current: usage.event_hooks_count,
                    max: tier.max_event_hooks,
                    percentage: tier.max_event_hooks > 0
                        ? (usage.event_hooks_count / tier.max_event_hooks) * 100
                        : 0,
                },
                collaboration_tables: {
                    current: usage.collaboration_tables_active,
                    max: tier.max_collaboration_tables,
                    percentage: (usage.collaboration_tables_active / tier.max_collaboration_tables) * 100,
                },
                memory: {
                    current: usage.memory_used_bytes,
                    max: tier.memory_size_bytes,
                    percentage: (usage.memory_used_bytes / tier.memory_size_bytes) * 100,
                },
                tokens: {
                    current: usage.tokens_used_monthly,
                    max: tier.token_budget_monthly,
                    percentage: (usage.tokens_used_monthly / tier.token_budget_monthly) * 100,
                },
            },
        };
    }
    /**
     * Check if user can perform an action (create agent, add event hook, etc.)
     */
    async canPerformAction(userId, resourceType) {
        const result = await (0, database_1.query)('SELECT can_perform_action($1, $2) as can_perform', [
            userId,
            resourceType,
        ]);
        return result.rows[0].can_perform;
    }
    /**
     * Track usage for a resource
     */
    async trackUsage(userId, resourceType, delta) {
        await (0, database_1.query)('SELECT update_tier_usage_count($1, $2, $3)', [userId, resourceType, delta]);
    }
    /**
     * Increment usage counter (convenience method)
     */
    async incrementUsage(userId, resourceType) {
        await this.trackUsage(userId, resourceType, 1);
    }
    /**
     * Decrement usage counter (convenience method)
     */
    async decrementUsage(userId, resourceType) {
        await this.trackUsage(userId, resourceType, -1);
    }
    /**
     * Check if user has access to a specific role
     */
    async hasRoleAccess(userId, roleType) {
        const tier = await this.getUserTier(userId);
        return tier.available_roles.includes(roleType);
    }
    /**
     * Check if user has advisor agent access
     */
    async hasAdvisorAccess(userId) {
        const tier = await this.getUserTier(userId);
        return tier.advisor_agent_level !== 'none';
    }
    /**
     * Get advisor agent level for user
     */
    async getAdvisorLevel(userId) {
        const tier = await this.getUserTier(userId);
        return tier.advisor_agent_level;
    }
    /**
     * Upgrade user to a new tier
     */
    async upgradeTier(userId, newTierName) {
        const newTier = await this.getTierByName(newTierName);
        if (!newTier) {
            throw new errorHandler_1.AppError(404, 'TIER_NOT_FOUND', 'Tier not found');
        }
        await (0, database_1.query)('UPDATE users SET tier_id = $1, tier_started_at = NOW(), updated_at = NOW() WHERE id = $2', [newTier.id, userId]);
    }
    /**
     * Reset monthly usage counters (called by scheduled job)
     */
    async resetMonthlyUsage(userId) {
        await (0, database_1.query)(`UPDATE user_tier_usage 
       SET tokens_used_monthly = 0, last_reset_at = NOW(), updated_at = NOW()
       WHERE user_id = $1`, [userId]);
    }
    /**
     * Get usage history for analytics
     */
    async getUsageHistory(userId, resourceType, limit = 100) {
        let sql = `
      SELECT * FROM tier_usage_history 
      WHERE user_id = $1
    `;
        const params = [userId];
        if (resourceType) {
            sql += ' AND resource_type = $2';
            params.push(resourceType);
        }
        sql += ' ORDER BY timestamp DESC LIMIT $' + (params.length + 1);
        params.push(limit);
        const result = await (0, database_1.query)(sql, params);
        return result.rows;
    }
    /**
     * Check if action would exceed limits and throw error if so
     */
    async enforceLimit(userId, resourceType) {
        const canPerform = await this.canPerformAction(userId, resourceType);
        if (!canPerform) {
            const limits = await this.getTierLimits(userId);
            const resourceLimit = limits.limits[resourceType];
            throw new errorHandler_1.AppError(403, 'TIER_LIMIT_EXCEEDED', `You have reached your ${resourceType} limit (${resourceLimit.current}/${resourceLimit.max}). Please upgrade your plan.`, {
                resource: resourceType,
                current: resourceLimit.current,
                max: resourceLimit.max,
                tier: limits.tier.name,
            });
        }
    }
}
exports.TierService = TierService;
exports.default = new TierService();
//# sourceMappingURL=tier.service.js.map