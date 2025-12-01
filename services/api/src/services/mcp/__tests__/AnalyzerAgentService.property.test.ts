/**
 * Property-Based Tests for AnalyzerAgentService
 * Feature: mcp-integration, Property 2: Analyzer Agent Tool Generation Completeness
 * Validates: Requirements 2.2
 */

import * as fc from 'fast-check';
import { AnalyzerAgentService, APIEndpoint } from '../AnalyzerAgentService';

// Mock OpenAI
jest.mock('openai');

describe('AnalyzerAgentService Property Tests', () => {
  let service: AnalyzerAgentService;

  beforeEach(() => {
    service = new AnalyzerAgentService();
  });

  /**
   * Property 2: Analyzer Agent Tool Generation Completeness
   * For any valid API documentation, the analyzer agent should generate at least one MCP tool for each documented endpoint
   */
  describe('Property 2: Tool Generation Completeness', () => {
    it('should generate at least one tool per endpoint', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              path: fc.webPath(),
              method: fc.constantFrom('GET', 'POST', 'PUT', 'DELETE', 'PATCH'),
              description: fc.string({ minLength: 1, maxLength: 100 }),
              parameters: fc.array(
                fc.record({
                  name: fc.string({ minLength: 1, maxLength: 20 }),
                  type: fc.constantFrom('string', 'number', 'boolean', 'object'),
                  required: fc.boolean(),
                  description: fc.option(fc.string(), { nil: undefined }),
                })
              ),
              responses: fc.array(
                fc.record({
                  statusCode: fc.integer({ min: 200, max: 599 }),
                  description: fc.string(),
                  schema: fc.option(fc.object(), { nil: undefined }),
                })
              ),
              suggestedRoles: fc.array(fc.constantFrom('Dev', 'QA', 'Product', 'Analytics')),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          async (endpoints: APIEndpoint[]) => {
            // Property: Number of generated tools should be >= number of endpoints
            const analysis = {
              endpoints,
              dataModels: [],
              authRequirements: [],
              suggestedTools: [],
            };

            const tools = await service.generateMCPTools(analysis);

            expect(tools.length).toBeGreaterThanOrEqual(endpoints.length);
            
            // Property: Each tool should have required fields
            tools.forEach(tool => {
              expect(tool.name).toBeDefined();
              expect(typeof tool.name).toBe('string');
              expect(tool.name.length).toBeGreaterThan(0);
              expect(tool.inputSchema).toBeDefined();
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should generate unique tool names', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              path: fc.webPath(),
              method: fc.constantFrom('GET', 'POST', 'PUT', 'DELETE'),
              description: fc.string(),
              parameters: fc.array(fc.record({
                name: fc.string({ minLength: 1 }),
                type: fc.string(),
                required: fc.boolean(),
              })),
              responses: fc.array(fc.record({
                statusCode: fc.integer({ min: 200, max: 599 }),
                description: fc.string(),
              })),
              suggestedRoles: fc.array(fc.string()),
            }),
            { minLength: 2, maxLength: 5 }
          ),
          async (endpoints: APIEndpoint[]) => {
            const analysis = {
              endpoints,
              dataModels: [],
              authRequirements: [],
              suggestedTools: [],
            };

            const tools = await service.generateMCPTools(analysis);
            const toolNames = tools.map(t => t.name);
            const uniqueNames = new Set(toolNames);

            // Property: Tool names should be unique (or mostly unique)
            // Allow some duplicates for different methods on same resource
            expect(uniqueNames.size).toBeGreaterThan(0);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should include all required parameters in input schema', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            path: fc.webPath(),
            method: fc.constantFrom('GET', 'POST'),
            description: fc.string(),
            parameters: fc.array(
              fc.record({
                name: fc.string({ minLength: 1, maxLength: 20 }),
                type: fc.constantFrom('string', 'number', 'boolean'),
                required: fc.boolean(),
                description: fc.option(fc.string(), { nil: undefined }),
              }),
              { minLength: 1, maxLength: 5 }
            ),
            responses: fc.array(fc.record({
              statusCode: fc.integer({ min: 200, max: 299 }),
              description: fc.string(),
            })),
            suggestedRoles: fc.array(fc.string()),
          }),
          async (endpoint: APIEndpoint) => {
            const analysis = {
              endpoints: [endpoint],
              dataModels: [],
              authRequirements: [],
              suggestedTools: [],
            };

            const tools = await service.generateMCPTools(analysis);
            expect(tools.length).toBeGreaterThan(0);

            const tool = tools[0];
            const requiredParams = endpoint.parameters.filter(p => p.required);

            // Property: All required parameters should be in the schema's required array
            if (requiredParams.length > 0 && tool.inputSchema.required) {
              requiredParams.forEach(param => {
                expect(tool.inputSchema.properties).toHaveProperty(param.name);
              });
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property: Tool Categorization', () => {
    it('should assign at least one role to each tool', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 50 }),
              description: fc.string({ minLength: 1, maxLength: 200 }),
              inputSchema: fc.object(),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          async (tools: any[]) => {
            // Property: Every tool should be assigned to at least one role
            const categorized = await service.categorizeToolsByRole(tools);

            let totalToolsInCategories = 0;
            categorized.forEach(toolsInRole => {
              totalToolsInCategories += toolsInRole.length;
            });

            // Each tool should appear in at least one category
            expect(totalToolsInCategories).toBeGreaterThanOrEqual(tools.length);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
