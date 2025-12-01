"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceService = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
class WorkspaceService {
    /**
     * Create a new conversation
     */
    async createConversation(userId, input) {
        const result = await (0, database_1.query)(`INSERT INTO conversations (
        user_id, name, mode, max_rounds, token_budget, participating_agents
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`, [
            userId,
            input.name,
            input.mode,
            input.max_rounds || 3,
            input.token_budget || 10000,
            input.participating_agents,
        ]);
        return result.rows[0];
    }
    /**
     * Add a message to a conversation
     */
    async addMessage(conversationId, input) {
        const result = await (0, database_1.query)(`INSERT INTO messages (
        conversation_id, sender_type, sender_id, sender_name, sender_role,
        content, message_type, tokens, response_time, mentions, reply_to
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`, [
            conversationId,
            input.sender_type,
            input.sender_id,
            input.sender_name,
            input.sender_role,
            input.content,
            input.message_type || 'normal',
            input.tokens || 0,
            input.response_time,
            input.mentions || [],
            input.reply_to,
        ]);
        return result.rows[0];
    }
    /**
     * Get conversation by ID
     */
    async getConversation(conversationId, userId) {
        const result = await (0, database_1.query)('SELECT * FROM conversations WHERE id = $1 AND user_id = $2', [conversationId, userId]);
        if (result.rows.length === 0) {
            throw new errorHandler_1.AppError(404, 'CONVERSATION_NOT_FOUND', 'Conversation not found');
        }
        return result.rows[0];
    }
    /**
     * Get conversation history (messages)
     */
    async getConversationHistory(conversationId, userId, limit) {
        // Verify user owns conversation
        await this.getConversation(conversationId, userId);
        let sql = `
      SELECT * FROM messages 
      WHERE conversation_id = $1 
      ORDER BY created_at ASC
    `;
        const params = [conversationId];
        if (limit) {
            sql += ' LIMIT $2';
            params.push(limit);
        }
        const result = await (0, database_1.query)(sql, params);
        return result.rows;
    }
    /**
     * List conversations for user
     */
    async listConversations(userId, status, limit = 50) {
        let sql = 'SELECT * FROM conversations WHERE user_id = $1';
        const params = [userId];
        if (status) {
            sql += ' AND status = $2';
            params.push(status);
        }
        sql += ' ORDER BY updated_at DESC LIMIT $' + (params.length + 1);
        params.push(limit);
        const result = await (0, database_1.query)(sql, params);
        return result.rows;
    }
    /**
     * Archive a conversation
     */
    async archiveConversation(conversationId, userId) {
        const result = await (0, database_1.query)(`UPDATE conversations 
       SET status = 'archived', archived_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND user_id = $2`, [conversationId, userId]);
        if (result.rowCount === 0) {
            throw new errorHandler_1.AppError(404, 'CONVERSATION_NOT_FOUND', 'Conversation not found');
        }
    }
    /**
     * Reopen an archived conversation
     */
    async reopenConversation(conversationId, userId) {
        const result = await (0, database_1.query)(`UPDATE conversations 
       SET status = 'active', archived_at = NULL, updated_at = NOW()
       WHERE id = $1 AND user_id = $2`, [conversationId, userId]);
        if (result.rowCount === 0) {
            throw new errorHandler_1.AppError(404, 'CONVERSATION_NOT_FOUND', 'Conversation not found');
        }
    }
    /**
     * Search messages across conversations
     */
    async searchMessages(userId, searchTerm, limit = 50) {
        const result = await (0, database_1.query)(`SELECT m.* FROM messages m
       JOIN conversations c ON c.id = m.conversation_id
       WHERE c.user_id = $1 AND m.content ILIKE $2
       ORDER BY m.created_at DESC
       LIMIT $3`, [userId, `%${searchTerm}%`, limit]);
        return result.rows;
    }
    /**
     * Filter messages by criteria
     */
    async filterMessages(userId, filters, limit = 50) {
        let sql = `
      SELECT m.* FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE c.user_id = $1
    `;
        const params = [userId];
        let paramIndex = 2;
        if (filters.conversationId) {
            sql += ` AND m.conversation_id = $${paramIndex}`;
            params.push(filters.conversationId);
            paramIndex++;
        }
        if (filters.senderType) {
            sql += ` AND m.sender_type = $${paramIndex}`;
            params.push(filters.senderType);
            paramIndex++;
        }
        if (filters.messageType) {
            sql += ` AND m.message_type = $${paramIndex}`;
            params.push(filters.messageType);
            paramIndex++;
        }
        if (filters.dateFrom) {
            sql += ` AND m.created_at >= $${paramIndex}`;
            params.push(filters.dateFrom);
            paramIndex++;
        }
        if (filters.dateTo) {
            sql += ` AND m.created_at <= $${paramIndex}`;
            params.push(filters.dateTo);
            paramIndex++;
        }
        sql += ` ORDER BY m.created_at DESC LIMIT $${paramIndex}`;
        params.push(limit);
        const result = await (0, database_1.query)(sql, params);
        return result.rows;
    }
    /**
     * Update conversation status
     */
    async updateConversationStatus(conversationId, userId, status) {
        const result = await (0, database_1.query)(`UPDATE conversations 
       SET status = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3`, [status, conversationId, userId]);
        if (result.rowCount === 0) {
            throw new errorHandler_1.AppError(404, 'CONVERSATION_NOT_FOUND', 'Conversation not found');
        }
    }
    /**
     * Get messages with mentions for a user
     */
    async getMentions(userId, limit = 50) {
        // Get user's agents
        const agentsResult = await (0, database_1.query)('SELECT id FROM agents WHERE user_id = $1', [userId]);
        const agentIds = agentsResult.rows.map((row) => row.id);
        if (agentIds.length === 0) {
            return [];
        }
        const result = await (0, database_1.query)(`SELECT m.* FROM messages m
       JOIN conversations c ON c.id = m.conversation_id
       WHERE c.user_id = $1 
       AND m.mentions && $2
       ORDER BY m.created_at DESC
       LIMIT $3`, [userId, agentIds, limit]);
        return result.rows;
    }
    /**
     * Export conversation to JSON
     */
    async exportConversation(conversationId, userId) {
        const conversation = await this.getConversation(conversationId, userId);
        const messages = await this.getConversationHistory(conversationId, userId);
        return {
            conversation,
            messages,
            exported_at: new Date(),
        };
    }
}
exports.WorkspaceService = WorkspaceService;
exports.default = new WorkspaceService();
//# sourceMappingURL=workspace.service.js.map