export interface AdvisorSummary {
    id: string;
    user_id: string;
    time_range_start: Date;
    time_range_end: Date;
    executive_summary: string;
    key_insights: any[];
    priority_alerts: any[];
    forecasts: any[];
    strategic_recommendations: any[];
    agent_activity_overview: any[];
    conflicts: any[];
    generated_at: Date;
}
export declare class AdvisorAgentService {
    /**
     * Generate advisor summary for a time range
     */
    generateSummary(userId: string, timeRangeStart: Date, timeRangeEnd: Date): Promise<AdvisorSummary>;
    /**
     * Get latest advisor summary
     */
    getLatestSummary(userId: string): Promise<AdvisorSummary | null>;
    /**
     * Get agent activity for time range
     */
    private getAgentActivity;
    /**
     * Get conversations for time range
     */
    private getConversations;
    /**
     * Get business events for time range
     */
    private getBusinessEvents;
    /**
     * Generate insights from data
     */
    private generateInsights;
    /**
     * Identify priority alerts
     */
    private identifyAlerts;
    /**
     * Identify conflicts in conversations
     */
    private identifyConflicts;
    /**
     * Generate forecasts
     */
    private generateForecasts;
    /**
     * Generate strategic recommendations
     */
    private generateRecommendations;
    /**
     * Create executive summary
     */
    private createExecutiveSummary;
}
declare const _default: AdvisorAgentService;
export default _default;
//# sourceMappingURL=advisorAgent.service.d.ts.map