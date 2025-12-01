"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvisorAgentService = void 0;
const database_1 = require("../config/database");
class AdvisorAgentService {
    /**
     * Generate advisor summary for a time range
     */
    async generateSummary(userId, timeRangeStart, timeRangeEnd) {
        // Gather data from various sources
        const agentActivity = await this.getAgentActivity(userId, timeRangeStart, timeRangeEnd);
        const conversations = await this.getConversations(userId, timeRangeStart, timeRangeEnd);
        const events = await this.getBusinessEvents(userId, timeRangeStart, timeRangeEnd);
        // Generate insights
        const keyInsights = await this.generateInsights(agentActivity, conversations, events);
        const priorityAlerts = await this.identifyAlerts(agentActivity, conversations, events);
        const conflicts = await this.identifyConflicts(conversations);
        const forecasts = await this.generateForecasts(agentActivity, events);
        const recommendations = await this.generateRecommendations(keyInsights, priorityAlerts, conflicts);
        // Create executive summary
        const executiveSummary = this.createExecutiveSummary(keyInsights, priorityAlerts, recommendations);
        // Store summary
        const result = await (0, database_1.query)(`INSERT INTO advisor_summaries (
        user_id, time_range_start, time_range_end, executive_summary,
        key_insights, priority_alerts, forecasts, strategic_recommendations,
        agent_activity_overview, conflicts
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`, [
            userId,
            timeRangeStart,
            timeRangeEnd,
            executiveSummary,
            JSON.stringify(keyInsights),
            JSON.stringify(priorityAlerts),
            JSON.stringify(forecasts),
            JSON.stringify(recommendations),
            JSON.stringify(agentActivity),
            JSON.stringify(conflicts),
        ]);
        return result.rows[0];
    }
    /**
     * Get latest advisor summary
     */
    async getLatestSummary(userId) {
        const result = await (0, database_1.query)(`SELECT * FROM advisor_summaries 
       WHERE user_id = $1 
       ORDER BY generated_at DESC 
       LIMIT 1`, [userId]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }
    /**
     * Get agent activity for time range
     */
    async getAgentActivity(userId, start, end) {
        const result = await (0, database_1.query)(`SELECT 
        a.id, a.name, a.role_type,
        COUNT(DISTINCT m.id) as message_count,
        SUM(m.tokens) as total_tokens,
        COUNT(DISTINCT tc.id) as tool_calls
       FROM agents a
       LEFT JOIN messages m ON m.sender_id = a.id::text 
         AND m.created_at BETWEEN $2 AND $3
       LEFT JOIN tool_calls tc ON tc.message_id = m.id
       WHERE a.user_id = $1
       GROUP BY a.id, a.name, a.role_type`, [userId, start, end]);
        return result.rows;
    }
    /**
     * Get conversations for time range
     */
    async getConversations(userId, start, end) {
        const result = await (0, database_1.query)(`SELECT * FROM conversations 
       WHERE user_id = $1 
       AND created_at BETWEEN $2 AND $3
       ORDER BY created_at DESC`, [userId, start, end]);
        return result.rows;
    }
    /**
     * Get business events for time range
     */
    async getBusinessEvents(userId, start, end) {
        const result = await (0, database_1.query)(`SELECT * FROM business_events 
       WHERE user_id = $1 
       AND created_at BETWEEN $2 AND $3
       ORDER BY created_at DESC`, [userId, start, end]);
        return result.rows;
    }
    /**
     * Generate insights from data
     */
    async generateInsights(agentActivity, conversations, events) {
        const insights = [];
        // Most active agent
        const mostActive = agentActivity.reduce((prev, current) => prev.message_count > current.message_count ? prev : current);
        if (mostActive) {
            insights.push({
                category: 'operations',
                title: 'Most Active Agent',
                description: `${mostActive.name} (${mostActive.role_type}) has been the most active with ${mostActive.message_count} messages.`,
                trend: 'positive',
                actionable: false,
            });
        }
        // Event patterns
        if (events.length > 0) {
            const eventTypes = events.reduce((acc, event) => {
                acc[event.event_type] = (acc[event.event_type] || 0) + 1;
                return acc;
            }, {});
            const topEvent = Object.entries(eventTypes).sort((a, b) => b[1] - a[1])[0];
            insights.push({
                category: 'customer',
                title: 'Top Event Type',
                description: `${topEvent[0]} events occurred ${topEvent[1]} times.`,
                trend: 'neutral',
                actionable: true,
            });
        }
        return insights;
    }
    /**
     * Identify priority alerts
     */
    async identifyAlerts(agentActivity, conversations, events) {
        const alerts = [];
        // Check for inactive agents
        const inactiveAgents = agentActivity.filter((a) => a.message_count === 0);
        if (inactiveAgents.length > 0) {
            alerts.push({
                priority: 'medium',
                title: 'Inactive Agents',
                description: `${inactiveAgents.length} agents have not been active in this period.`,
                affectedArea: 'Operations',
                suggestedAction: 'Review agent configurations and event subscriptions.',
            });
        }
        // Check for high token usage
        const highTokenAgents = agentActivity.filter((a) => a.total_tokens > 50000);
        if (highTokenAgents.length > 0) {
            alerts.push({
                priority: 'high',
                title: 'High Token Usage',
                description: `${highTokenAgents.length} agents have high token usage.`,
                affectedArea: 'Cost',
                suggestedAction: 'Review agent prompts and optimize for efficiency.',
            });
        }
        return alerts;
    }
    /**
     * Identify conflicts in conversations
     */
    async identifyConflicts(conversations) {
        // Placeholder - in production, analyze message content for disagreements
        return [];
    }
    /**
     * Generate forecasts
     */
    async generateForecasts(agentActivity, events) {
        const forecasts = [];
        // Token usage forecast
        const totalTokens = agentActivity.reduce((sum, a) => sum + (a.total_tokens || 0), 0);
        forecasts.push({
            metric: 'Token Usage',
            currentValue: totalTokens,
            predictedValue: Math.round(totalTokens * 1.2), // 20% growth
            timeframe: 'Next 30 Days',
            confidence: 75,
            methodology: 'Linear trend analysis',
            factors: ['Current usage patterns', 'Agent activity levels'],
        });
        return forecasts;
    }
    /**
     * Generate strategic recommendations
     */
    async generateRecommendations(insights, alerts, conflicts) {
        const recommendations = [];
        // Based on alerts
        if (alerts.length > 0) {
            recommendations.push({
                title: 'Address Priority Alerts',
                description: `You have ${alerts.length} priority alerts that need attention.`,
                priority: 'high',
                confidence: 90,
                supportingAgents: [],
                opposingAgents: [],
                evidence: alerts.map((a) => a.title),
                risks: ['Delayed action may impact operations'],
                estimatedImpact: 'High',
            });
        }
        return recommendations;
    }
    /**
     * Create executive summary
     */
    createExecutiveSummary(insights, alerts, recommendations) {
        let summary = 'Executive Summary:\n\n';
        if (insights.length > 0) {
            summary += `Key Insights: ${insights.length} insights identified. `;
        }
        if (alerts.length > 0) {
            summary += `Priority Alerts: ${alerts.length} items require attention. `;
        }
        if (recommendations.length > 0) {
            summary += `Strategic Recommendations: ${recommendations.length} recommendations provided.`;
        }
        return summary;
    }
}
exports.AdvisorAgentService = AdvisorAgentService;
exports.default = new AdvisorAgentService();
//# sourceMappingURL=advisorAgent.service.js.map