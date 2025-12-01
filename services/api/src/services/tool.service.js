"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolService = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
class ToolService {
    encryptionKey;
    constructor() {
        this.encryptionKey = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012';
    }
    /**
     * Encrypt sensitive data (API keys, credentials)
     */
    encrypt(text) {
        const iv = crypto_1.default.randomBytes(16);
        const cipher = crypto_1.default.createCipheriv('aes-256-gcm', Buffer.from(this.encryptionKey), iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag();
        return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
    }
    /**
     * Decrypt sensitive data
     */
    decrypt(encryptedText) {
        const parts = encryptedText.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encrypted = parts[2];
        const decipher = crypto_1.default.createDecipheriv('aes-256-gcm', Buffer.from(this.encryptionKey), iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    /**
     * Register a new tool
     */
    async registerTool(userId, name, description, handlerType, handlerConfig, parameters) {
        // Encrypt sensitive fields in handler_config
        const configToStore = { ...handlerConfig };
        if (configToStore.apiKey) {
            configToStore.apiKey = this.encrypt(configToStore.apiKey);
        }
        if (configToStore.credentials) {
            configToStore.credentials = this.encrypt(JSON.stringify(configToStore.credentials));
        }
        const result = await (0, database_1.query)(`INSERT INTO tools (user_id, name, description, parameters, handler_type, handler_config)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [
            userId,
            name,
            description,
            JSON.stringify(parameters || {}),
            handlerType,
            JSON.stringify(configToStore),
        ]);
        return result.rows[0];
    }
    /**
     * Execute a tool
     */
    async executeTool(toolId, parameters) {
        const startTime = Date.now();
        // Get tool configuration
        const toolResult = await (0, database_1.query)('SELECT * FROM tools WHERE id = $1', [toolId]);
        if (toolResult.rows.length === 0) {
            throw new errorHandler_1.AppError(404, 'TOOL_NOT_FOUND', 'Tool not found');
        }
        const tool = toolResult.rows[0];
        try {
            let data;
            switch (tool.handler_type) {
                case 'rest_api':
                    data = await this.executeRestAPI(tool, parameters);
                    break;
                case 'database':
                    data = await this.executeDatabaseQuery(tool, parameters);
                    break;
                case 'crm':
                    data = await this.executeCRMQuery(tool, parameters);
                    break;
                case 'web_search':
                    data = await this.executeWebSearch(tool, parameters);
                    break;
                case 'custom':
                    data = await this.executeCustom(tool, parameters);
                    break;
                default:
                    throw new errorHandler_1.AppError(400, 'INVALID_TOOL_TYPE', `Unknown tool type: ${tool.handler_type}`);
            }
            const duration = Date.now() - startTime;
            return { data, duration };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            throw new errorHandler_1.AppError(500, 'TOOL_EXECUTION_ERROR', `Tool execution failed: ${error.message}`, { duration, originalError: error.message });
        }
    }
    /**
     * Execute REST API tool
     */
    async executeRestAPI(tool, parameters) {
        const config = tool.handler_config;
        // Decrypt API key if present
        let headers = { ...config.headers };
        if (config.apiKey) {
            const decryptedKey = this.decrypt(config.apiKey);
            headers['Authorization'] = `Bearer ${decryptedKey}`;
        }
        const response = await (0, axios_1.default)({
            method: config.method || 'GET',
            url: config.url,
            headers,
            data: parameters,
            timeout: tool.timeout_ms || 30000,
        });
        return response.data;
    }
    /**
     * Execute database query tool
     */
    async executeDatabaseQuery(tool, parameters) {
        // For security, only allow parameterized queries
        const config = tool.handler_config;
        const queryText = config.query;
        // Replace parameters in query
        const result = await (0, database_1.query)(queryText, Object.values(parameters));
        return result.rows;
    }
    /**
     * Execute CRM query tool
     */
    async executeCRMQuery(tool, parameters) {
        const config = tool.handler_config;
        // Decrypt credentials
        const credentials = config.credentials
            ? JSON.parse(this.decrypt(config.credentials))
            : {};
        // This is a placeholder - in production, integrate with actual CRM APIs
        // (Salesforce, HubSpot, etc.)
        return {
            message: 'CRM integration placeholder',
            parameters,
            credentials: '***',
        };
    }
    /**
     * Execute web search tool
     */
    async executeWebSearch(tool, parameters) {
        const config = tool.handler_config;
        const searchQuery = parameters.query || parameters.q;
        // This is a placeholder - in production, integrate with search APIs
        // (Google, Bing, etc.)
        return {
            message: 'Web search placeholder',
            query: searchQuery,
            results: [],
        };
    }
    /**
     * Execute custom tool
     */
    async executeCustom(tool, parameters) {
        const config = tool.handler_config;
        // Execute custom webhook
        if (config.webhookUrl) {
            const response = await axios_1.default.post(config.webhookUrl, parameters, {
                timeout: tool.timeout_ms || 30000,
            });
            return response.data;
        }
        throw new errorHandler_1.AppError(400, 'INVALID_CUSTOM_TOOL', 'Custom tool configuration invalid');
    }
    /**
     * Create a tool call record
     */
    async createToolCall(messageId, toolId, toolName, parameters) {
        const result = await (0, database_1.query)(`INSERT INTO tool_calls (message_id, tool_id, tool_name, parameters, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`, [messageId, toolId, toolName, JSON.stringify(parameters)]);
        return result.rows[0];
    }
    /**
     * Update tool call with results
     */
    async updateToolCall(toolCallId, status, responseData, duration, error) {
        await (0, database_1.query)(`UPDATE tool_calls 
       SET status = $1, response_data = $2, duration = $3, error = $4
       WHERE id = $5`, [status, responseData ? JSON.stringify(responseData) : null, duration, error, toolCallId]);
    }
    /**
     * Get tool calls for a message
     */
    async getMessageToolCalls(messageId) {
        const result = await (0, database_1.query)('SELECT * FROM tool_calls WHERE message_id = $1', [messageId]);
        return result.rows;
    }
    /**
     * Get tools for an agent
     */
    async getAgentTools(agentId) {
        // Get agent's tool IDs from agent.tools array
        const agentResult = await (0, database_1.query)('SELECT tools, user_id FROM agents WHERE id = $1', [agentId]);
        if (agentResult.rows.length === 0) {
            return [];
        }
        const agent = agentResult.rows[0];
        const toolNames = agent.tools || [];
        if (toolNames.length === 0) {
            return [];
        }
        // Get tools by name for this user
        const result = await (0, database_1.query)('SELECT * FROM tools WHERE user_id = $1 AND name = ANY($2)', [agent.user_id, toolNames]);
        return result.rows;
    }
    /**
     * Validate tool access for agent
     */
    async validateToolAccess(agentId, toolId) {
        const agentTools = await this.getAgentTools(agentId);
        return agentTools.some((tool) => tool.id === toolId);
    }
}
exports.ToolService = ToolService;
exports.default = new ToolService();
//# sourceMappingURL=tool.service.js.map