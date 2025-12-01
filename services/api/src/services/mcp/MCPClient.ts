import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { AppError } from '../../middleware/errorHandler';

export interface MCPTool {
  name: string;
  description?: string;
  inputSchema: any;
}

export interface MCPConnectionConfig {
  serverUrl: string;
  authType?: 'none' | 'bearer' | 'api-key';
  credentials?: string;
}

export class MCPClient {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;
  private config: MCPConnectionConfig;
  private connected: boolean = false;

  constructor(config: MCPConnectionConfig) {
    this.config = config;
  }

  /**
   * Connect to MCP server
   */
  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    try {
      // Initialize MCP client
      this.client = new Client(
        {
          name: 'agentdeck-client',
          version: '1.0.0',
        },
        {
          capabilities: {},
        }
      );

      // For now, we'll use stdio transport
      // In production, you'd implement HTTP/WebSocket transport based on serverUrl
      this.transport = new StdioClientTransport({
        command: 'node',
        args: [this.config.serverUrl],
      });

      await this.client.connect(this.transport);
      this.connected = true;
    } catch (error) {
      throw new AppError(
        500,
        'MCP_CONNECTION_FAILED',
        `Failed to connect to MCP server: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Disconnect from MCP server
   */
  async disconnect(): Promise<void> {
    if (!this.connected || !this.client) {
      return;
    }

    try {
      await this.client.close();
      this.connected = false;
      this.client = null;
      this.transport = null;
    } catch (error) {
      console.error('Error disconnecting from MCP server:', error);
    }
  }

  /**
   * List available tools from MCP server
   */
  async listTools(): Promise<MCPTool[]> {
    if (!this.connected || !this.client) {
      throw new AppError(400, 'MCP_NOT_CONNECTED', 'MCP client is not connected');
    }

    try {
      const response = await this.client.listTools();
      
      return response.tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      }));
    } catch (error) {
      throw new AppError(
        500,
        'MCP_LIST_TOOLS_FAILED',
        `Failed to list tools: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Call a tool on the MCP server
   */
  async callTool(name: string, args: any): Promise<any> {
    if (!this.connected || !this.client) {
      throw new AppError(400, 'MCP_NOT_CONNECTED', 'MCP client is not connected');
    }

    try {
      const response = await this.client.callTool({
        name,
        arguments: args,
      });

      return response.content;
    } catch (error) {
      throw new AppError(
        500,
        'MCP_TOOL_CALL_FAILED',
        `Failed to call tool ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if client is connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get connection config (without credentials)
   */
  getConfig(): Omit<MCPConnectionConfig, 'credentials'> {
    return {
      serverUrl: this.config.serverUrl,
      authType: this.config.authType,
    };
  }
}
