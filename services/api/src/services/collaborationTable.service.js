"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollaborationTableService = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const workspace_service_1 = __importDefault(require("./workspace.service"));
const tier_service_1 = __importDefault(require("./tier.service"));
class CollaborationTableService {
    /**
     * Create a new collaboration table
     */
    async createTable(userId, input) {
        // Check tier limits
        await tier_service_1.default.enforceLimit(userId, 'collaboration_tables');
        // Create associated conversation
        const conversation = await workspace_service_1.default.createConversation(userId, {
            name: `Table: ${input.name}`,
            mode: 'sequential',
            max_rounds: 4, // One round per phase
            token_budget: input.token_budget || 10000,
            participating_agents: input.participating_agents,
        });
        // Create table
        const result = await (0, database_1.query)(`INSERT INTO collaboration_tables (
        user_id, name, topic, desired_outcome, participating_agents,
        token_budget, time_limit_minutes, conversation_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`, [
            userId,
            input.name,
            input.topic,
            input.desired_outcome,
            input.participating_agents,
            input.token_budget || 10000,
            input.time_limit_minutes,
            conversation.id,
        ]);
        // Increment usage
        await tier_service_1.default.incrementUsage(userId, 'collaboration_tables');
        return result.rows[0];
    }
    /**
     * Get table by ID
     */
    async getTable(tableId, userId) {
        const result = await (0, database_1.query)('SELECT * FROM collaboration_tables WHERE id = $1 AND user_id = $2', [tableId, userId]);
        if (result.rows.length === 0) {
            throw new errorHandler_1.AppError(404, 'TABLE_NOT_FOUND', 'Collaboration table not found');
        }
        return result.rows[0];
    }
    /**
     * Advance to next phase
     */
    async advancePhase(tableId, userId) {
        const table = await this.getTable(tableId, userId);
        const phaseOrder = [
            'data_gathering',
            'analysis',
            'debate',
            'recommendation',
        ];
        const currentIndex = phaseOrder.indexOf(table.current_phase);
        if (currentIndex === phaseOrder.length - 1) {
            // Already at last phase, mark as completed
            return this.completeTable(tableId, userId);
        }
        const nextPhase = phaseOrder[currentIndex + 1];
        const result = await (0, database_1.query)(`UPDATE collaboration_tables 
       SET current_phase = $1
       WHERE id = $2 AND user_id = $3
       RETURNING *`, [nextPhase, tableId, userId]);
        return result.rows[0];
    }
    /**
     * Complete a table with output
     */
    async completeTable(tableId, userId) {
        const result = await (0, database_1.query)(`UPDATE collaboration_tables 
       SET status = 'completed', completed_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`, [tableId, userId]);
        if (result.rowCount === 0) {
            throw new errorHandler_1.AppError(404, 'TABLE_NOT_FOUND', 'Collaboration table not found');
        }
        // Decrement active tables count
        await tier_service_1.default.decrementUsage(userId, 'collaboration_tables');
        return result.rows[0];
    }
    /**
     * Update table output
     */
    async updateOutput(tableId, userId, output) {
        const updates = [];
        const params = [];
        let paramIndex = 1;
        if (output.summary !== undefined) {
            updates.push(`output_summary = $${paramIndex}`);
            params.push(output.summary);
            paramIndex++;
        }
        if (output.recommendations !== undefined) {
            updates.push(`output_recommendations = $${paramIndex}`);
            params.push(JSON.stringify(output.recommendations));
            paramIndex++;
        }
        if (output.action_items !== undefined) {
            updates.push(`output_action_items = $${paramIndex}`);
            params.push(JSON.stringify(output.action_items));
            paramIndex++;
        }
        if (output.dissenting_opinions !== undefined) {
            updates.push(`output_dissenting_opinions = $${paramIndex}`);
            params.push(JSON.stringify(output.dissenting_opinions));
            paramIndex++;
        }
        if (updates.length === 0)
            return;
        params.push(tableId, userId);
        const sql = `
      UPDATE collaboration_tables 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
    `;
        await (0, database_1.query)(sql, params);
    }
    /**
     * List tables for user
     */
    async listTables(userId, status) {
        let sql = 'SELECT * FROM collaboration_tables WHERE user_id = $1';
        const params = [userId];
        if (status) {
            sql += ' AND status = $2';
            params.push(status);
        }
        sql += ' ORDER BY created_at DESC';
        const result = await (0, database_1.query)(sql, params);
        return result.rows;
    }
    /**
     * Get phase instructions for agents
     */
    getPhaseInstructions(phase) {
        const instructions = {
            data_gathering: 'Focus on gathering relevant data using your tools. Share what you find with the team.',
            analysis: 'Analyze the data gathered in the previous phase. Identify patterns, insights, and key findings.',
            debate: 'Discuss different perspectives and approaches. Challenge assumptions and explore alternatives.',
            recommendation: 'Synthesize the discussion into clear recommendations. Provide actionable next steps.',
        };
        return instructions[phase];
    }
}
exports.CollaborationTableService = CollaborationTableService;
exports.default = new CollaborationTableService();
//# sourceMappingURL=collaborationTable.service.js.map