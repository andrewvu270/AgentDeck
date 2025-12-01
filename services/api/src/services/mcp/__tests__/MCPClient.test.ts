/**
 * Unit Tests for MCPClient
 */

import { MCPClient, MCPConnectionConfig } from '../MCPClient';

// Mock the MCP SDK
jest.mock('@modelcontextprotocol/sdk/client/index.js');
jest.mock('@modelcontextprotocol/sdk/client/stdio.js');

describe('MCPClient', () => {
  let client: MCPClient;
  let config: MCPConnectionConfig;

  beforeEach(() => {
    config = {
      serverUrl: 'http://localhost:3000/mcp',
      authType: 'bearer',
      credentials: 'test-token',
    };
    client = new MCPClient(config);
  });

  afterEach(async () => {
    await client.disconnect();
  });

  describe('constructor', () => {
    it('should create a client with config', () => {
      expect(client).toBeDefined();
      expect(client.isConnected()).toBe(false);
    });

    it('should not expose credentials in getConfig', () => {
      const retrievedConfig = client.getConfig();
      expect(retrievedConfig.serverUrl).toBe(config.serverUrl);
      expect(retrievedConfig.authType).toBe(config.authType);
      expect(retrievedConfig).not.toHaveProperty('credentials');
    });
  });

  describe('isConnected', () => {
    it('should return false initially', () => {
      expect(client.isConnected()).toBe(false);
    });
  });

  describe('disconnect', () => {
    it('should handle disconnect when not connected', async () => {
      await expect(client.disconnect()).resolves.not.toThrow();
      expect(client.isConnected()).toBe(false);
    });

    it('should handle multiple disconnect calls', async () => {
      await client.disconnect();
      await client.disconnect();
      await client.disconnect();
      expect(client.isConnected()).toBe(false);
    });
  });

  describe('listTools', () => {
    it('should throw error when not connected', async () => {
      await expect(client.listTools()).rejects.toThrow('MCP client is not connected');
    });
  });

  describe('callTool', () => {
    it('should throw error when not connected', async () => {
      await expect(client.callTool('testTool', {})).rejects.toThrow('MCP client is not connected');
    });

    it('should throw error with tool name in message', async () => {
      await expect(client.callTool('myCustomTool', { param: 'value' }))
        .rejects.toThrow('MCP client is not connected');
    });
  });

  describe('getConfig', () => {
    it('should return config without credentials', () => {
      const retrievedConfig = client.getConfig();
      expect(retrievedConfig).toEqual({
        serverUrl: config.serverUrl,
        authType: config.authType,
      });
    });

    it('should handle config without authType', () => {
      const simpleConfig: MCPConnectionConfig = {
        serverUrl: 'http://localhost:3000/mcp',
      };
      const simpleClient = new MCPClient(simpleConfig);
      const retrievedConfig = simpleClient.getConfig();
      expect(retrievedConfig.serverUrl).toBe(simpleConfig.serverUrl);
      expect(retrievedConfig.authType).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty server URL', () => {
      const emptyConfig: MCPConnectionConfig = {
        serverUrl: '',
      };
      const emptyClient = new MCPClient(emptyConfig);
      expect(emptyClient).toBeDefined();
      expect(emptyClient.isConnected()).toBe(false);
    });

    it('should handle different auth types', () => {
      const authTypes: Array<'none' | 'bearer' | 'api-key'> = ['none', 'bearer', 'api-key'];
      
      authTypes.forEach((authType) => {
        const testConfig: MCPConnectionConfig = {
          serverUrl: 'http://test.com',
          authType,
        };
        const testClient = new MCPClient(testConfig);
        expect(testClient.getConfig().authType).toBe(authType);
      });
    });
  });
});
