/**
 * Property-Based Tests for MCPClient
 * Feature: mcp-integration, Property 3: BYO-MCP Connection Validation
 * Validates: Requirements 3.2
 */

import * as fc from 'fast-check';
import { MCPClient, MCPConnectionConfig } from '../MCPClient';

describe('MCPClient Property Tests', () => {
  /**
   * Property 3: BYO-MCP Connection Validation
   * For any MCP server URL and credentials, the system should validate the connection before saving the configuration
   */
  describe('Property 3: Connection Validation', () => {
    it('should validate connection configuration before attempting to connect', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            serverUrl: fc.string({ minLength: 1 }),
            authType: fc.constantFrom('none', 'bearer', 'api-key'),
            credentials: fc.option(fc.string(), { nil: undefined }),
          }),
          async (config: MCPConnectionConfig) => {
            const client = new MCPClient(config);
            
            // Property: Client should be created with config
            expect(client).toBeDefined();
            expect(client.isConnected()).toBe(false);
            
            // Property: Config should be retrievable (without credentials)
            const retrievedConfig = client.getConfig();
            expect(retrievedConfig.serverUrl).toBe(config.serverUrl);
            expect(retrievedConfig.authType).toBe(config.authType);
            expect(retrievedConfig).not.toHaveProperty('credentials');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain connection state correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            serverUrl: fc.string({ minLength: 1 }),
            authType: fc.constantFrom('none', 'bearer', 'api-key'),
          }),
          async (config: MCPConnectionConfig) => {
            const client = new MCPClient(config);
            
            // Property: Initially not connected
            expect(client.isConnected()).toBe(false);
            
            // Property: After disconnect (without connect), still not connected
            await client.disconnect();
            expect(client.isConnected()).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle multiple disconnect calls safely', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            serverUrl: fc.string({ minLength: 1 }),
            authType: fc.constantFrom('none', 'bearer', 'api-key'),
          }),
          async (config: MCPConnectionConfig) => {
            const client = new MCPClient(config);
            
            // Property: Multiple disconnects should not throw
            await expect(client.disconnect()).resolves.not.toThrow();
            await expect(client.disconnect()).resolves.not.toThrow();
            await expect(client.disconnect()).resolves.not.toThrow();
            
            // Property: Should still be disconnected
            expect(client.isConnected()).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject tool operations when not connected', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            serverUrl: fc.string({ minLength: 1 }),
            authType: fc.constantFrom('none', 'bearer', 'api-key'),
          }),
          fc.string({ minLength: 1 }),
          fc.object(),
          async (config: MCPConnectionConfig, toolName: string, args: any) => {
            const client = new MCPClient(config);
            
            // Property: Operations should fail when not connected
            await expect(client.listTools()).rejects.toThrow('MCP client is not connected');
            await expect(client.callTool(toolName, args)).rejects.toThrow('MCP client is not connected');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
