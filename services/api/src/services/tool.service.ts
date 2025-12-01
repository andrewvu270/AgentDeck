import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import axios from 'axios';
import crypto from 'crypto';

export type ToolType = 'rest_api' | 'database' | 'crm' | 'web_search' | 'custom';

export interface Tool {
  id: string;
  user_id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
  handler_type: ToolType;
  handler_config: Record<string, any>;
  timeout_ms: number;
  created_at: Date;
}

export interface ToolCall {
  id: string;
  message_id: string;
  tool_id: string;
  tool_name: string;
  parameters: Record<string, any>;
  response_data?: any;
  status: 'pending' | 'running' | 'success' | 'error';
  duration?: number;
  error?: string;
  created_at: Date;
}

export class ToolService {
  private encryptionKey: string;

  constructor() {
    this.encryptionKey = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012';
  }

  /**
   * Encrypt sensitive data (API keys, credentials)
   */
  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      Buffer.from(this.encryptionKey),
      iv
    );

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt sensitive data
   */
  private decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(this.encryptionKey),
      iv
    );
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Register a new tool
   */
  async registerTool(
    userId: string,
    name: string,
    description: string,
    handlerType: ToolType,
    handlerConfig: Record<string, any>,
    parameters?: Record<string, any>
  ): Promise<Tool> {
    // Encrypt sensitive fields in handler_config
    const configToStore = { ...handlerConfig };
    if (configToStore.apiKey) {
      configToStore.apiKey = this.encrypt(configToStore.apiKey);
    }
    if (configToStore.credentials) {
      configToStore.credentials = this.encrypt(JSON.stringify(configToStore.credentials));
    }

    const result = await query(
      `INSERT INTO tools (user_id, name, description, parameters, handler_type, handler_config)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        userId,
        name,
        description,
        JSON.stringify(parameters || {}),
        handlerType,
        JSON.stringify(configToStore),
      ]
    );

    return result.rows[0];
  }

  /**
   * Execute a tool
   */
  async executeTool(
    toolId: string,
    parameters: Record<string, any>
  ): Promise<{ data: any; duration: number }> {
    const startTime = Date.now();

    // Get tool configuration
    const toolResult = await query('SELECT * FROM tools WHERE id = $1', [toolId]);

    if (toolResult.rows.length === 0) {
      throw new AppError(404, 'TOOL_NOT_FOUND', 'Tool not found');
    }

    const tool: Tool = toolResult.rows[0];

    try {
      let data: any;

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
          throw new AppError(400, 'INVALID_TOOL_TYPE', `Unknown tool type: ${tool.handler_type}`);
      }

      const duration = Date.now() - startTime;
      return { data, duration };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      throw new AppError(
        500,
        'TOOL_EXECUTION_ERROR',
        `Tool execution failed: ${error.message}`,
        { duration, originalError: error.message }
      );
    }
  }

  /**
   * Execute REST API tool
   */
  private async executeRestAPI(tool: Tool, parameters: Record<string, any>): Promise<any> {
    const config = tool.handler_config;

    // Decrypt API key if present
    let headers = { ...config.headers };
    if (config.apiKey) {
      const decryptedKey = this.decrypt(config.apiKey);
      headers['Authorization'] = `Bearer ${decryptedKey}`;
    }

    const response = await axios({
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
  private async executeDatabaseQuery(tool: Tool, parameters: Record<string, any>): Promise<any> {
    // For security, only allow parameterized queries
    const config = tool.handler_config;
    const queryText = config.query;

    // Replace parameters in query
    const result = await query(queryText, Object.values(parameters));
    return result.rows;
  }

  /**
   * Execute CRM query tool
   */
  private async executeCRMQuery(tool: Tool, parameters: Record<string, any>): Promise<any> {
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
  private async executeWebSearch(tool: Tool, parameters: Record<string, any>): Promise<any> {
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
  private async executeCustom(tool: Tool, parameters: Record<string, any>): Promise<any> {
    const config = tool.handler_config;

    // Execute custom webhook
    if (config.webhookUrl) {
      const response = await axios.post(config.webhookUrl, parameters, {
        timeout: tool.timeout_ms || 30000,
      });
      return response.data;
    }

    throw new AppError(400, 'INVALID_CUSTOM_TOOL', 'Custom tool configuration invalid');
  }

  /**
   * Create a tool call record
   */
  async createToolCall(
    messageId: string,
    toolId: string,
    toolName: string,
    parameters: Record<string, any>
  ): Promise<ToolCall> {
    const result = await query(
      `INSERT INTO tool_calls (message_id, tool_id, tool_name, parameters, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [messageId, toolId, toolName, JSON.stringify(parameters)]
    );

    return result.rows[0];
  }

  /**
   * Update tool call with results
   */
  async updateToolCall(
    toolCallId: string,
    status: 'success' | 'error',
    responseData?: any,
    duration?: number,
    error?: string
  ): Promise<void> {
    await query(
      `UPDATE tool_calls 
       SET status = $1, response_data = $2, duration = $3, error = $4
       WHERE id = $5`,
      [status, responseData ? JSON.stringify(responseData) : null, duration, error, toolCallId]
    );
  }

  /**
   * Get tool calls for a message
   */
  async getMessageToolCalls(messageId: string): Promise<ToolCall[]> {
    const result = await query('SELECT * FROM tool_calls WHERE message_id = $1', [messageId]);
    return result.rows;
  }

  /**
   * Get tools for an agent
   */
  async getAgentTools(agentId: string): Promise<Tool[]> {
    // Get agent's tool IDs from agent.tools array
    const agentResult = await query('SELECT tools, user_id FROM agents WHERE id = $1', [agentId]);

    if (agentResult.rows.length === 0) {
      return [];
    }

    const agent = agentResult.rows[0];
    const toolNames = agent.tools || [];

    if (toolNames.length === 0) {
      return [];
    }

    // Get tools by name for this user
    const result = await query(
      'SELECT * FROM tools WHERE user_id = $1 AND name = ANY($2)',
      [agent.user_id, toolNames]
    );

    return result.rows;
  }

  /**
   * Validate tool access for agent
   */
  async validateToolAccess(agentId: string, toolId: string): Promise<boolean> {
    const agentTools = await this.getAgentTools(agentId);
    return agentTools.some((tool) => tool.id === toolId);
  }
}

export default new ToolService();
