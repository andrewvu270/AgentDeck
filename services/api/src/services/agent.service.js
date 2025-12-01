"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentService = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const tier_service_1 = __importDefault(require("./tier.service"));
class AgentService {
    /**
     * Get role template by role type
     */
    async getRoleTemplate(roleType) {
        const result = await (0, database_1.query)('SELECT * FROM role_templates WHERE role_type = $1', [roleType]);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    }
    /**
     * Get all available role templates
     */
    async getAllRoleTemplates() {
        const result = await (0, database_1.query)('SELECT * FROM role_templates ORDER BY role_type');
        return result.rows;
    }
    /**
     * Apply role template defaults to agent input
     */
    async applyRoleDefaults(input) {
        if (!input.role_type) {
            return input;
        }
        const template = await this.getRoleTemplate(input.role_type);
        if (!template) {
            return input;
        }
        // Apply defaults if not provided
        return {
            ...input,
            system_prompt: input.system_prompt || template.default_system_prompt,
            role_responsibilities: input.role_responsibilities || template.default_responsibilities,
            role_avatar_color: input.role_avatar_color || template.default_avatar_color,
            tools: input.tools || template.suggested_tools,
            event_subscriptions: input.event_subscriptions || template.suggested_event_types,
        };
    }
    async create(userId, input) {
        // Check tier limits before creating agent
        await tier_service_1.default.enforceLimit(userId, 'agents');
        // Check if user has access to this role
        if (input.role_type) {
            const hasAccess = await tier_service_1.default.hasRoleAccess(userId, input.role_type);
            if (!hasAccess) {
                throw new errorHandler_1.AppError(403, 'ROLE_NOT_AVAILABLE', `The ${input.role_type} role is not available in your current plan. Please upgrade.`);
            }
        }
        // Check if user can create advisor agent
        if (input.is_advisor) {
            const hasAdvisorAccess = await tier_service_1.default.hasAdvisorAccess(userId);
            if (!hasAdvisorAccess) {
                throw new errorHandler_1.AppError(403, 'ADVISOR_NOT_AVAILABLE', 'Advisor agents are not available in your current plan. Please upgrade.');
            }
        }
        // Apply role defaults if role is specified
        const agentInput = await this.applyRoleDefaults(input);
        const result = await (0, database_1.query)(`INSERT INTO agents (
        user_id, name, description, model, provider, system_prompt, tools, config,
        role_type, role_responsibilities, role_avatar_color, event_subscriptions, is_advisor, status
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`, [
            userId,
            agentInput.name,
            agentInput.description,
            agentInput.model,
            agentInput.provider,
            agentInput.system_prompt,
            JSON.stringify(agentInput.tools || []),
            JSON.stringify(agentInput.config || {}),
            agentInput.role_type,
            agentInput.role_responsibilities,
            agentInput.role_avatar_color || '#667eea',
            JSON.stringify(agentInput.event_subscriptions || []),
            agentInput.is_advisor || false,
            'online',
        ]);
        const agent = result.rows[0];
        // Increment usage counter
        await tier_service_1.default.incrementUsage(userId, 'agents');
        // Save initial version
        await (0, database_1.query)('INSERT INTO agent_versions (agent_id, version, config) VALUES ($1, $2, $3)', [agent.id, 1, JSON.stringify(agent)]);
        return agent;
    }
    async update(agentId, userId, input) {
        // Get current agent
        const current = await this.get(agentId, userId);
        // Apply role defaults if role is being changed
        let updateInput = input;
        if (input.role_type && input.role_type !== current.role_type) {
            updateInput = await this.applyRoleDefaults(input);
        }
        const result = await (0, database_1.query)(`UPDATE agents 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           model = COALESCE($3, model),
           provider = COALESCE($4, provider),
           system_prompt = COALESCE($5, system_prompt),
           tools = COALESCE($6, tools),
           config = COALESCE($7, config),
           role_type = COALESCE($8, role_type),
           role_responsibilities = COALESCE($9, role_responsibilities),
           role_avatar_color = COALESCE($10, role_avatar_color),
           event_subscriptions = COALESCE($11, event_subscriptions),
           is_advisor = COALESCE($12, is_advisor),
           version = version + 1,
           updated_at = NOW()
       WHERE id = $13 AND user_id = $14
       RETURNING *`, [
            updateInput.name,
            updateInput.description,
            updateInput.model,
            updateInput.provider,
            updateInput.system_prompt,
            updateInput.tools ? JSON.stringify(updateInput.tools) : null,
            updateInput.config ? JSON.stringify(updateInput.config) : null,
            updateInput.role_type,
            updateInput.role_responsibilities,
            updateInput.role_avatar_color,
            updateInput.event_subscriptions ? JSON.stringify(updateInput.event_subscriptions) : null,
            updateInput.is_advisor,
            agentId,
            userId,
        ]);
        if (result.rows.length === 0) {
            throw new errorHandler_1.AppError(404, 'AGENT_NOT_FOUND', 'Agent not found');
        }
        const agent = result.rows[0];
        // Save version
        await (0, database_1.query)('INSERT INTO agent_versions (agent_id, version, config) VALUES ($1, $2, $3)', [agent.id, agent.version, JSON.stringify(agent)]);
        return agent;
    }
    /**
     * Update agent status
     */
    async updateStatus(agentId, userId, status) {
        const result = await (0, database_1.query)('UPDATE agents SET status = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3', [status, agentId, userId]);
        if (result.rowCount === 0) {
            throw new errorHandler_1.AppError(404, 'AGENT_NOT_FOUND', 'Agent not found');
        }
    }
    /**
     * Get agents by role type
     */
    async getByRole(userId, roleType) {
        const result = await (0, database_1.query)('SELECT * FROM agents WHERE user_id = $1 AND role_type = $2 ORDER BY created_at DESC', [userId, roleType]);
        return result.rows;
    }
    /**
     * Get advisor agent for user
     */
    async getAdvisorAgent(userId) {
        const result = await (0, database_1.query)('SELECT * FROM agents WHERE user_id = $1 AND is_advisor = TRUE LIMIT 1', [userId]);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    }
    async delete(agentId, userId) {
        const result = await (0, database_1.query)('DELETE FROM agents WHERE id = $1 AND user_id = $2', [
            agentId,
            userId,
        ]);
        if (result.rowCount === 0) {
            throw new errorHandler_1.AppError(404, 'AGENT_NOT_FOUND', 'Agent not found');
        }
        // Decrement usage counter
        await tier_service_1.default.decrementUsage(userId, 'agents');
    }
    async get(agentId, userId) {
        const result = await (0, database_1.query)('SELECT * FROM agents WHERE id = $1 AND user_id = $2', [
            agentId,
            userId,
        ]);
        if (result.rows.length === 0) {
            throw new errorHandler_1.AppError(404, 'AGENT_NOT_FOUND', 'Agent not found');
        }
        return result.rows[0];
    }
    async list(userId) {
        const result = await (0, database_1.query)('SELECT * FROM agents WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        return result.rows;
    }
    async rollback(agentId, userId, version) {
        // Get version config
        const versionResult = await (0, database_1.query)('SELECT config FROM agent_versions WHERE agent_id = $1 AND version = $2', [agentId, version]);
        if (versionResult.rows.length === 0) {
            throw new errorHandler_1.AppError(404, 'VERSION_NOT_FOUND', 'Version not found');
        }
        const config = versionResult.rows[0].config;
        // Update agent with old config
        const result = await (0, database_1.query)(`UPDATE agents 
       SET name = $1, description = $2, model = $3, provider = $4,
           system_prompt = $5, tools = $6, config = $7,
           version = version + 1, updated_at = NOW()
       WHERE id = $8 AND user_id = $9
       RETURNING *`, [
            config.name,
            config.description,
            config.model,
            config.provider,
            config.system_prompt,
            config.tools,
            config.config,
            agentId,
            userId,
        ]);
        return result.rows[0];
    }
}
exports.AgentService = AgentService;
exports.default = new AgentService();
//# sourceMappingURL=agent.service.js.map