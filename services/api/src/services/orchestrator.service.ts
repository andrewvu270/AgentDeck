import { query } from '../config/database';
import workspaceService, { CollaborationMode } from './workspace.service';
import agentService from './agent.service';
import toolService from './tool.service';
import { decrypt } from '../utils/encryption';

export interface AgentContext {
  conversationId: string;
  messages: any[];
  currentRound: number;
  remainingTokens: number;
  mode: CollaborationMode;
  userPrompt: string;
  agentInstructions: string;
}

export class OrchestratorService {
  /**
   * Build context for agent invocation
   */
  async buildAgentContext(
    conversationId: string,
    agentId: string,
    userId: string
  ): Promise<AgentContext> {
    // Get conversation
    const conversation = await workspaceService.getConversation(conversationId, userId);

    // Get messages
    const messages = await workspaceService.getConversationHistory(conversationId, userId);

    // Get agent
    const agent = await agentService.get(agentId, userId);

    // Build instructions based on mode and role
    let instructions = agent.system_prompt;

    if (agent.role_type) {
      instructions += `\n\nYour role: ${agent.role_responsibilities}`;
    }

    // Add mode-specific instructions for multi-agent collaboration
    instructions += `\n\nYou are part of a multi-agent conversation. Other agents will also respond to the user's messages.`;
    instructions += `\nYou should read and respond to what other agents say, not just the user.`;
    instructions += `\nEngage in dialogue with other agents - agree, disagree, build on their ideas, or ask them questions.`;
    
    if (conversation.mode === 'debate') {
      instructions += '\n\nYou are in debate mode. Challenge opposing viewpoints from other agents constructively.';
    } else if (conversation.mode === 'brainstorm') {
      instructions += '\n\nYou are in brainstorm mode. Build on other agents\' ideas creatively.';
    } else if (conversation.mode === 'sequential') {
      instructions += '\n\nYou are in sequential mode. Respond to both the user and previous agents\' messages.';
    }

    return {
      conversationId,
      messages: messages.map((m) => ({
        role: m.sender_type === 'user' ? 'user' : 'assistant',
        content: `[${m.sender_name}]: ${m.content}`,
      })),
      currentRound: Math.floor(conversation.message_count / conversation.participating_agents.length),
      remainingTokens: conversation.token_budget - conversation.total_tokens,
      mode: conversation.mode,
      userPrompt: messages[0]?.content || '',
      agentInstructions: instructions,
    };
  }

  /**
   * Start collaboration session
   */
  async startCollaboration(
    userId: string,
    conversationId: string,
    mode: CollaborationMode
  ): Promise<void> {
    const conversation = await workspaceService.getConversation(conversationId, userId);

    // Invoke agents based on mode
    if (mode === 'sequential') {
      // One after another - each agent sees previous agents' responses
      for (const agentId of conversation.participating_agents) {
        await this.invokeAgent(conversationId, agentId, userId);
        // Small delay to ensure message is committed
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } else if (mode === 'parallel') {
      // All at once - agents respond simultaneously without seeing each other
      await Promise.all(
        conversation.participating_agents.map((agentId) =>
          this.invokeAgent(conversationId, agentId, userId)
        )
      );
    } else if (mode === 'debate' || mode === 'brainstorm') {
      // Sequential with awareness - agents build on each other's responses
      for (const agentId of conversation.participating_agents) {
        await this.invokeAgent(conversationId, agentId, userId);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  /**
   * Invoke a single agent
   */
  async invokeAgent(conversationId: string, agentId: string, userId: string): Promise<void> {
    // Build context
    const context = await this.buildAgentContext(conversationId, agentId, userId);

    // Check token budget
    if (context.remainingTokens <= 0) {
      await workspaceService.updateConversationStatus(conversationId, userId, 'paused');
      return;
    }

    // Get agent
    const agent = await agentService.get(agentId, userId);

    // Get MCP tools if agent has them
    let mcpTools: any[] = [];
    if (agent.mcp_tools && agent.mcp_tools.length > 0 && agent.mcp_config_id) {
      const mcpManagerService = require('./mcp/MCPManagerService').default;
      const mcpConfig = await mcpManagerService.getMCPConfig(userId);
      
      if (mcpConfig) {
        // Get tool definitions from database
        const toolsResult = await query(
          `SELECT * FROM mcp_tools WHERE mcp_config_id = $1 AND name = ANY($2)`,
          [mcpConfig.id, agent.mcp_tools]
        );
        mcpTools = toolsResult.rows;
      }
    }

    // Get user's API key for this provider
    const apiKeyResult = await query(
      'SELECT encrypted_key FROM api_keys WHERE user_id = $1 AND provider = $2 LIMIT 1',
      [userId, agent.provider]
    );
    
    if (apiKeyResult.rows.length === 0) {
      throw new Error(`No API key found for provider: ${agent.provider}`);
    }
    
    // Decrypt the API key
    let apiKey: string;
    try {
      apiKey = decrypt(apiKeyResult.rows[0].encrypted_key);
      console.log(`Decrypted API key for ${agent.provider}: ${apiKey.substring(0, 10)}...`);
    } catch (error) {
      console.error('Failed to decrypt API key:', error);
      throw new Error('Failed to decrypt API key');
    }
    
    // Prepare tools for LLM (convert MCP tools to OpenAI function format)
    const llmTools = mcpTools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.input_schema,
      },
    }));
    
    // Call LLM API based on provider
    let response: { content: string; tokens: number };
    
    try {
      if (agent.provider === 'openai') {
        // Call OpenAI API with tools
        const requestBody: any = {
          model: agent.model,
          messages: [
            { role: 'system', content: context.agentInstructions },
            ...context.messages
          ],
          max_tokens: Math.min(context.remainingTokens, 1000),
        };

        // Add tools if available
        if (llmTools.length > 0) {
          requestBody.tools = llmTools;
          requestBody.tool_choice = 'auto';
        }

        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!openaiResponse.ok) {
          throw new Error(`OpenAI API error: ${openaiResponse.status}`);
        }

        const data: any = await openaiResponse.json();
        const message = data.choices[0].message;

        // Handle tool calls if present
        if (message.tool_calls && message.tool_calls.length > 0) {
          const mcpManagerService = require('./mcp/MCPManagerService').default;
          const mcpConfig = await mcpManagerService.getMCPConfig(userId);
          
          for (const toolCall of message.tool_calls) {
            const toolName = toolCall.function.name;
            const toolArgs = JSON.parse(toolCall.function.arguments);
            
            try {
              // Invoke MCP tool
              const toolResult = await mcpManagerService.invokeTool(mcpConfig, toolName, toolArgs);
              
              // Log tool invocation
              await query(
                `INSERT INTO mcp_tool_invocations (agent_id, tool_name, parameters, result, status, duration_ms)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [agentId, toolName, JSON.stringify(toolArgs), JSON.stringify(toolResult), 'success', 0]
              );
            } catch (error) {
              console.error(`Tool invocation failed for ${toolName}:`, error);
              await query(
                `INSERT INTO mcp_tool_invocations (agent_id, tool_name, parameters, error, status, duration_ms)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [agentId, toolName, JSON.stringify(toolArgs), error instanceof Error ? error.message : 'Unknown error', 'error', 0]
              );
            }
          }
        }

        response = {
          content: message.content || 'Tool execution completed',
          tokens: data.usage.total_tokens,
        };
      } else {
        // Fallback for unsupported providers
        response = {
          content: `[${agent.name}] Provider ${agent.provider} not yet implemented`,
          tokens: 50,
        };
      }
    } catch (error) {
      console.error('LLM invocation error:', error);
      response = {
        content: `[${agent.name}] Error generating response: ${error instanceof Error ? error.message : 'Unknown error'}`,
        tokens: 50,
      };
    }

    // Add message to conversation
    await workspaceService.addMessage(conversationId, {
      sender_type: 'agent',
      sender_id: agentId,
      sender_name: agent.name,
      sender_role: agent.role_type,
      content: response.content,
      tokens: response.tokens,
    });
  }

  /**
   * Enforce token budget
   */
  async enforceTokenBudget(conversationId: string, userId: string): Promise<boolean> {
    const conversation = await workspaceService.getConversation(conversationId, userId);
    return conversation.total_tokens < conversation.token_budget;
  }
}

export default new OrchestratorService();
