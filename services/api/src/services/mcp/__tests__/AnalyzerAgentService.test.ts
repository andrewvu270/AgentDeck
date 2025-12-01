/**
 * Unit Tests for AnalyzerAgentService
 */

import { AnalyzerAgentService } from '../AnalyzerAgentService';

// Mock dependencies
jest.mock('openai');
jest.mock('swagger-parser');

describe('AnalyzerAgentService', () => {
  let service: AnalyzerAgentService;

  beforeEach(() => {
    service = new AnalyzerAgentService();
    jest.clearAllMocks();
  });

  describe('generateMCPTools', () => {
    it('should generate tools from endpoints', async () => {
      const analysis = {
        endpoints: [
          {
            path: '/api/users',
            method: 'GET',
            description: 'Get all users',
            parameters: [],
            responses: [],
            suggestedRoles: ['Dev'],
          },
        ],
        dataModels: [],
        authRequirements: [],
        suggestedTools: [],
      };

      const tools = await service.generateMCPTools(analysis);

      expect(tools).toHaveLength(1);
      expect(tools[0].name).toBeDefined();
      expect(tools[0].description).toBe('Get all users');
      expect(tools[0].inputSchema).toBeDefined();
    });

    it('should handle multiple endpoints', async () => {
      const analysis = {
        endpoints: [
          {
            path: '/api/users',
            method: 'GET',
            description: 'Get users',
            parameters: [],
            responses: [],
            suggestedRoles: [],
          },
          {
            path: '/api/users',
            method: 'POST',
            description: 'Create user',
            parameters: [],
            responses: [],
            suggestedRoles: [],
          },
        ],
        dataModels: [],
        authRequirements: [],
        suggestedTools: [],
      };

      const tools = await service.generateMCPTools(analysis);

      expect(tools).toHaveLength(2);
      expect(tools[0].name).not.toBe(tools[1].name);
    });

    it('should include parameters in input schema', async () => {
      const analysis = {
        endpoints: [
          {
            path: '/api/users/{id}',
            method: 'GET',
            description: 'Get user by ID',
            parameters: [
              {
                name: 'id',
                type: 'string',
                required: true,
                description: 'User ID',
              },
            ],
            responses: [],
            suggestedRoles: [],
          },
        ],
        dataModels: [],
        authRequirements: [],
        suggestedTools: [],
      };

      const tools = await service.generateMCPTools(analysis);

      expect(tools[0].inputSchema.properties).toHaveProperty('id');
      expect(tools[0].inputSchema.required).toContain('id');
    });
  });

  describe('categorizeToolsByRole', () => {
    it('should categorize tools by role', async () => {
      const tools = [
        {
          name: 'getUsers',
          description: 'Get all users',
          inputSchema: {},
        },
        {
          name: 'runTest',
          description: 'Run QA test',
          inputSchema: {},
        },
      ];

      const categorized = await service.categorizeToolsByRole(tools);

      expect(categorized.size).toBeGreaterThan(0);
      expect(categorized.get('Dev')).toBeDefined();
      expect(categorized.get('QA')).toBeDefined();
    });

    it('should assign default role if no specific role identified', async () => {
      const tools = [
        {
          name: 'genericTool',
          description: 'A generic tool',
          inputSchema: {},
        },
      ];

      const categorized = await service.categorizeToolsByRole(tools);

      expect(categorized.get('Dev')).toBeDefined();
      expect(categorized.get('Dev')?.length).toBeGreaterThan(0);
    });
  });

  describe('analyzeOpenAPI', () => {
    it('should throw error for invalid OpenAPI spec', async () => {
      const invalidSpec = 'invalid json';

      await expect(service.analyzeOpenAPI(invalidSpec))
        .rejects.toThrow('Failed to parse OpenAPI spec');
    });
  });

  describe('analyzeGraphQL', () => {
    it('should analyze GraphQL schema', async () => {
      const schema = `
        type Query {
          users: [User]
        }
        type User {
          id: ID!
          name: String
        }
      `;

      // Mock OpenAI response
      const mockOpenAI = require('openai');
      mockOpenAI.prototype.chat = {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: JSON.stringify({
                  endpoints: [],
                  dataModels: [],
                  authRequirements: [],
                  suggestedTools: [],
                }),
              },
            }],
          }),
        },
      };

      const result = await service.analyzeGraphQL(schema);

      expect(result).toBeDefined();
      expect(result.endpoints).toBeDefined();
      expect(result.dataModels).toBeDefined();
    });
  });

  describe('analyzeRESTDocs', () => {
    it('should analyze REST documentation', async () => {
      const docs = 'GET /api/users - Get all users';

      // Mock OpenAI response
      const mockOpenAI = require('openai');
      mockOpenAI.prototype.chat = {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: JSON.stringify({
                  endpoints: [],
                  dataModels: [],
                  authRequirements: [],
                  suggestedTools: [],
                }),
              },
            }],
          }),
        },
      };

      const result = await service.analyzeRESTDocs(docs);

      expect(result).toBeDefined();
    });
  });
});
