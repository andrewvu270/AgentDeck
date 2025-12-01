import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import tierService from './tier.service';

export type EventType =
  | 'new_customer'
  | 'payment_failed'
  | 'churn_risk'
  | 'product_updated'
  | 'analytics_threshold'
  | 'calendar_event'
  | 'crm_change'
  | 'support_ticket'
  | 'inventory_low';

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

export class EventHookService {
  /**
   * Subscribe an agent to an event type
   */
  async subscribeAgent(
    userId: string,
    agentId: string,
    eventType: EventType,
    filters?: Record<string, any>
  ): Promise<EventSubscription> {
    // Check tier limits
    await tierService.enforceLimit(userId, 'event_hooks');

    // Verify agent belongs to user
    const agentCheck = await query('SELECT id FROM agents WHERE id = $1 AND user_id = $2', [
      agentId,
      userId,
    ]);

    if (agentCheck.rows.length === 0) {
      throw new AppError(404, 'AGENT_NOT_FOUND', 'Agent not found');
    }

    // Create subscription
    const result = await query(
      `INSERT INTO event_subscriptions (agent_id, event_type, filters)
       VALUES ($1, $2, $3)
       ON CONFLICT (agent_id, event_type) 
       DO UPDATE SET filters = $3, is_active = TRUE
       RETURNING *`,
      [agentId, eventType, JSON.stringify(filters || {})]
    );

    // Increment usage counter
    await tierService.incrementUsage(userId, 'event_hooks');

    return result.rows[0];
  }

  /**
   * Unsubscribe an agent from an event type
   */
  async unsubscribeAgent(userId: string, agentId: string, eventType: EventType): Promise<void> {
    const result = await query(
      `DELETE FROM event_subscriptions 
       WHERE agent_id = $1 AND event_type = $2
       AND agent_id IN (SELECT id FROM agents WHERE user_id = $3)`,
      [agentId, eventType, userId]
    );

    if (result.rowCount === 0) {
      throw new AppError(404, 'SUBSCRIPTION_NOT_FOUND', 'Subscription not found');
    }

    // Decrement usage counter
    await tierService.decrementUsage(userId, 'event_hooks');
  }

  /**
   * Get all subscriptions for an agent
   */
  async getAgentSubscriptions(agentId: string): Promise<EventSubscription[]> {
    const result = await query(
      'SELECT * FROM event_subscriptions WHERE agent_id = $1 AND is_active = TRUE',
      [agentId]
    );

    return result.rows;
  }

  /**
   * Get all agents subscribed to an event type
   */
  async getSubscribedAgents(userId: string, eventType: EventType): Promise<string[]> {
    const result = await query(
      `SELECT es.agent_id 
       FROM event_subscriptions es
       JOIN agents a ON a.id = es.agent_id
       WHERE a.user_id = $1 AND es.event_type = $2 AND es.is_active = TRUE`,
      [userId, eventType]
    );

    return result.rows.map((row) => row.agent_id);
  }

  /**
   * Handle incoming event from external system
   */
  async handleEvent(
    userId: string,
    eventType: EventType,
    source: string,
    data: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<BusinessEvent> {
    // Get subscribed agents
    const subscribedAgents = await this.getSubscribedAgents(userId, eventType);

    // Create event record
    const result = await query(
      `INSERT INTO business_events (user_id, event_type, source, data, metadata, triggered_agents)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        userId,
        eventType,
        source,
        JSON.stringify(data),
        JSON.stringify(metadata || {}),
        subscribedAgents,
      ]
    );

    const event = result.rows[0];

    // TODO: Trigger agents (will be implemented in orchestrator service)
    // For now, just return the event
    return event;
  }

  /**
   * Get event history for user
   */
  async getEventHistory(
    userId: string,
    eventType?: EventType,
    limit: number = 50
  ): Promise<BusinessEvent[]> {
    let sql = 'SELECT * FROM business_events WHERE user_id = $1';
    const params: any[] = [userId];

    if (eventType) {
      sql += ' AND event_type = $2';
      params.push(eventType);
    }

    sql += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1);
    params.push(limit);

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Track event response time
   */
  async trackEventResponse(
    eventId: string,
    agentId: string,
    responseTime: number
  ): Promise<void> {
    // Store in tier usage history for analytics
    const event = await query('SELECT user_id FROM business_events WHERE id = $1', [eventId]);

    if (event.rows.length > 0) {
      await query(
        `INSERT INTO tier_usage_history (user_id, tier_id, resource_type, amount)
         VALUES ($1, (SELECT tier_id FROM users WHERE id = $1), 'event_response', $2)`,
        [event.rows[0].user_id, responseTime]
      );
    }
  }

  /**
   * Toggle subscription active status
   */
  async toggleSubscription(userId: string, subscriptionId: string): Promise<void> {
    const result = await query(
      `UPDATE event_subscriptions 
       SET is_active = NOT is_active
       WHERE id = $1 
       AND agent_id IN (SELECT id FROM agents WHERE user_id = $2)`,
      [subscriptionId, userId]
    );

    if (result.rowCount === 0) {
      throw new AppError(404, 'SUBSCRIPTION_NOT_FOUND', 'Subscription not found');
    }
  }
}

export default new EventHookService();
