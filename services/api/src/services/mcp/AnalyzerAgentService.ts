import { AppError } from '../../middleware/errorHandler';
import { MCPTool } from './MCPClient';
import OpenAI from 'openai';

export interface APIAnalysisResult {
  endpoints: APIEndpoint[];
  dataModels: DataModel[];
  authRequirements: AuthRequirement[];
  suggestedTools: MCPTool[];
}

export interface APIEndpoint {
  path: string;
  method: string;
  description: string;
  parameters: Parameter[];
  responses: Response[];
  suggestedRoles: string[];
}

export interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface Response {
  statusCode: number;
  description: string;
  schema?: any;
}

export interface DataModel {
  name: string;
  properties: Record<string, any>;
}

export interface AuthRequirement {
  type: string;
  description: string;
}

export class AnalyzerAgentService {
  private openai: OpenAI;

  constructor() {
    // Initialize OpenAI client for LLM-based analysis
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }

  /**
   * Analyze OpenAPI specification
   */
  async analyzeOpenAPI(spec: string): Promise<APIAnalysisResult> {
    try {
      // Parse the OpenAPI spec
      const SwaggerParser = require('swagger-parser');
      const api = await SwaggerParser.validate(JSON.parse(spec));

      const endpoints: APIEndpoint[] = [];
      const dataModels: DataModel[] = [];
      const authRequirements: AuthRequirement[] = [];

      // Extract endpoints
      for (const [path, pathItem] of Object.entries(api.paths || {})) {
        for (const [method, operation] of Object.entries(pathItem as any)) {
          if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
            const op = operation as any;
            endpoints.push({
              path,
              method: method.toUpperCase(),
              description: op.summary || op.description || '',
              parameters: this.extractParameters(op.parameters || []),
              responses: this.extractResponses(op.responses || {}),
              suggestedRoles: await this.suggestRolesForEndpoint(path, method, op),
            });
          }
        }
      }

      // Extract data models from components/schemas
      if (api.components?.schemas) {
        for (const [name, schema] of Object.entries(api.components.schemas)) {
          dataModels.push({
            name,
            properties: (schema as any).properties || {},
          });
        }
      }

      // Extract auth requirements
      if (api.components?.securitySchemes) {
        for (const [name, scheme] of Object.entries(api.components.securitySchemes)) {
          authRequirements.push({
            type: (scheme as any).type,
            description: (scheme as any).description || name,
          });
        }
      }

      // Generate MCP tools from endpoints
      const suggestedTools = await this.generateMCPTools({
        endpoints,
        dataModels,
        authRequirements,
        suggestedTools: [],
      });

      return {
        endpoints,
        dataModels,
        authRequirements,
        suggestedTools,
      };
    } catch (error) {
      throw new AppError(
        400,
        'OPENAPI_PARSE_FAILED',
        `Failed to parse OpenAPI spec: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Analyze GraphQL schema
   */
  async analyzeGraphQL(schema: string): Promise<APIAnalysisResult> {
    try {
      // Use LLM to analyze GraphQL schema
      const analysis = await this.analyzewithLLM(schema, 'graphql');
      
      return {
        endpoints: analysis.endpoints || [],
        dataModels: analysis.dataModels || [],
        authRequirements: analysis.authRequirements || [],
        suggestedTools: analysis.suggestedTools || [],
      };
    } catch (error) {
      throw new AppError(
        400,
        'GRAPHQL_PARSE_FAILED',
        `Failed to parse GraphQL schema: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Analyze REST API documentation
   */
  async analyzeRESTDocs(docs: string): Promise<APIAnalysisResult> {
    try {
      // Use LLM to analyze REST documentation
      const analysis = await this.analyzewithLLM(docs, 'rest');
      
      return {
        endpoints: analysis.endpoints || [],
        dataModels: analysis.dataModels || [],
        authRequirements: analysis.authRequirements || [],
        suggestedTools: analysis.suggestedTools || [],
      };
    } catch (error) {
      throw new AppError(
        400,
        'REST_PARSE_FAILED',
        `Failed to parse REST docs: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate MCP tools from API analysis
   */
  async generateMCPTools(analysis: APIAnalysisResult): Promise<MCPTool[]> {
    const tools: MCPTool[] = [];

    for (const endpoint of analysis.endpoints) {
      const toolName = this.generateToolName(endpoint.path, endpoint.method);
      const inputSchema = this.generateInputSchema(endpoint.parameters);

      tools.push({
        name: toolName,
        description: endpoint.description || `${endpoint.method} ${endpoint.path}`,
        inputSchema,
      });
    }

    return tools;
  }

  /**
   * Categorize tools by role
   */
  async categorizeToolsByRole(tools: MCPTool[]): Promise<Map<string, MCPTool[]>> {
    const categorized = new Map<string, MCPTool[]>();

    // Use LLM to categorize tools
    for (const tool of tools) {
      const roles = await this.suggestRolesForTool(tool);
      
      for (const role of roles) {
        if (!categorized.has(role)) {
          categorized.set(role, []);
        }
        categorized.get(role)!.push(tool);
      }
    }

    return categorized;
  }

  /**
   * Use LLM to analyze API documentation
   */
  private async analyzewithLLM(docs: string, type: 'graphql' | 'rest'): Promise<any> {
    const prompt = `Analyze the following ${type.toUpperCase()} API documentation and extract:
1. All endpoints/operations with their methods, paths, parameters, and descriptions
2. Data models/types
3. Authentication requirements
4. Suggest appropriate agent roles for each endpoint (Dev, QA, Product, Analytics, Support, etc.)

API Documentation:
${docs}

Respond in JSON format with the following structure:
{
  "endpoints": [{"path": "", "method": "", "description": "", "parameters": [], "suggestedRoles": []}],
  "dataModels": [{"name": "", "properties": {}}],
  "authRequirements": [{"type": "", "description": ""}],
  "suggestedTools": [{"name": "", "description": "", "inputSchema": {}}]
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an API analysis expert. Analyze API documentation and extract structured information.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content || '{}');
    } catch (error) {
      console.error('LLM analysis failed:', error);
      return {
        endpoints: [],
        dataModels: [],
        authRequirements: [],
        suggestedTools: [],
      };
    }
  }

  /**
   * Suggest roles for an endpoint using LLM
   */
  private async suggestRolesForEndpoint(
    path: string,
    method: string,
    operation: any
  ): Promise<string[]> {
    const description = operation.summary || operation.description || '';
    
    // Simple heuristics for role suggestion
    const roles: string[] = [];
    
    if (path.includes('/test') || path.includes('/qa')) roles.push('QA');
    if (path.includes('/analytics') || path.includes('/metrics')) roles.push('Analytics');
    if (path.includes('/user') || path.includes('/customer')) roles.push('Support', 'CX');
    if (method === 'POST' || method === 'PUT') roles.push('Dev');
    if (method === 'GET' && path.includes('/report')) roles.push('Product', 'Analytics');
    
    // Default to Dev if no specific role identified
    if (roles.length === 0) roles.push('Dev');
    
    return roles;
  }

  /**
   * Suggest roles for a tool
   */
  private async suggestRolesForTool(tool: MCPTool): Promise<string[]> {
    // Extract roles from tool name and description
    const text = `${tool.name} ${tool.description}`.toLowerCase();
    const roles: string[] = [];
    
    if (text.includes('test') || text.includes('qa')) roles.push('QA');
    if (text.includes('analytic') || text.includes('metric') || text.includes('report')) roles.push('Analytics');
    if (text.includes('user') || text.includes('customer') || text.includes('support')) roles.push('Support');
    if (text.includes('product') || text.includes('feature')) roles.push('Product');
    if (text.includes('create') || text.includes('update') || text.includes('delete')) roles.push('Dev');
    
    // Default to Dev if no specific role
    if (roles.length === 0) roles.push('Dev');
    
    return roles;
  }

  /**
   * Generate tool name from endpoint
   */
  private generateToolName(path: string, method: string): string {
    // Convert /api/users/{id} to getUserById
    const parts = path.split('/').filter(p => p && !p.startsWith('{'));
    const resource = parts[parts.length - 1] || 'resource';
    
    const methodMap: Record<string, string> = {
      GET: 'get',
      POST: 'create',
      PUT: 'update',
      DELETE: 'delete',
      PATCH: 'patch',
    };
    
    const action = methodMap[method.toUpperCase()] || method.toLowerCase();
    return `${action}${resource.charAt(0).toUpperCase() + resource.slice(1)}`;
  }

  /**
   * Generate input schema from parameters
   */
  private generateInputSchema(parameters: Parameter[]): any {
    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const param of parameters) {
      properties[param.name] = {
        type: param.type,
        description: param.description,
      };
      
      if (param.required) {
        required.push(param.name);
      }
    }

    return {
      type: 'object',
      properties,
      required,
    };
  }

  /**
   * Extract parameters from OpenAPI operation
   */
  private extractParameters(params: any[]): Parameter[] {
    return params.map(p => ({
      name: p.name,
      type: p.schema?.type || 'string',
      required: p.required || false,
      description: p.description,
    }));
  }

  /**
   * Extract responses from OpenAPI operation
   */
  private extractResponses(responses: any): Response[] {
    return Object.entries(responses).map(([code, response]: [string, any]) => ({
      statusCode: parseInt(code),
      description: response.description || '',
      schema: response.content?.['application/json']?.schema,
    }));
  }
}

export default new AnalyzerAgentService();
