"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionService = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const encryption_1 = require("../utils/encryption");
const openai_adapter_1 = __importDefault(require("./llm/openai.adapter"));
class ExecutionService {
    async execute(agentId, userId, input) {
        const startTime = Date.now();
        // Get agent
        const agentResult = await (0, database_1.query)('SELECT * FROM agents WHERE id = $1 AND user_id = $2', [
            agentId,
            userId,
        ]);
        if (agentResult.rows.length === 0) {
            throw new errorHandler_1.AppError(404, 'AGENT_NOT_FOUND', 'Agent not found');
        }
        const agent = agentResult.rows[0];
        // Get API key for provider
        const keyResult = await (0, database_1.query)('SELECT encrypted_key FROM api_keys WHERE user_id = $1 AND provider = $2', [userId, agent.provider]);
        if (keyResult.rows.length === 0) {
            throw new errorHandler_1.AppError(400, 'API_KEY_NOT_FOUND', `API key for ${agent.provider} not found`);
        }
        const apiKey = (0, encryption_1.decrypt)(keyResult.rows[0].encrypted_key);
        // Create execution record
        const execResult = await (0, database_1.query)(`INSERT INTO executions (agent_id, user_id, input, status, trace)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`, [agentId, userId, input, 'running', JSON.stringify({ messages: [] })]);
        const execution = execResult.rows[0];
        try {
            // Build messages
            const messages = [
                { role: 'system', content: agent.system_prompt },
                { role: 'user', content: input },
            ];
            // Call LLM
            const response = await openai_adapter_1.default.call(apiKey, {
                model: agent.model,
                messages,
                temperature: agent.config.temperature || 0.7,
                max_tokens: agent.config.max_tokens || 1000,
            });
            const latencyMs = Date.now() - startTime;
            const cost = openai_adapter_1.default.calculateCost(agent.model, response.tokens_used);
            // Update execution
            await (0, database_1.query)(`UPDATE executions 
         SET output = $1, status = $2, tokens_used = $3, cost_usd = $4,
             latency_ms = $5, completed_at = NOW(), trace = $6
         WHERE id = $7`, [
                response.content,
                'completed',
                response.tokens_used,
                cost,
                latencyMs,
                JSON.stringify({ messages, response }),
                execution.id,
            ]);
            return {
                ...execution,
                output: response.content,
                status: 'completed',
                tokens_used: response.tokens_used,
                cost_usd: cost,
                latency_ms: latencyMs,
            };
        }
        catch (error) {
            // Update execution with error
            await (0, database_1.query)(`UPDATE executions 
         SET status = $1, error = $2, completed_at = NOW()
         WHERE id = $3`, ['failed', JSON.stringify({ message: error.message }), execution.id]);
            throw new errorHandler_1.AppError(500, 'EXECUTION_FAILED', error.message);
        }
    }
    async get(executionId, userId) {
        const result = await (0, database_1.query)('SELECT * FROM executions WHERE id = $1 AND user_id = $2', [
            executionId,
            userId,
        ]);
        if (result.rows.length === 0) {
            throw new errorHandler_1.AppError(404, 'EXECUTION_NOT_FOUND', 'Execution not found');
        }
        return result.rows[0];
    }
    async list(userId, agentId) {
        let queryText = 'SELECT * FROM executions WHERE user_id = $1';
        const params = [userId];
        if (agentId) {
            queryText += ' AND agent_id = $2';
            params.push(agentId);
        }
        queryText += ' ORDER BY created_at DESC LIMIT 100';
        const result = await (0, database_1.query)(queryText, params);
        return result.rows;
    }
}
exports.ExecutionService = ExecutionService;
exports.default = new ExecutionService();
//# sourceMappingURL=execution.service.js.map