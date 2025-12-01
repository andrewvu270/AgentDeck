# AgentDeck

Deploy specialized AI agent teams directly into your applications through automated MCP (Model Context Protocol) integration.

## Overview

AgentDeck is a platform that analyzes your application's API and builds an MCP server, then deploys role-based AI agents that can interact with your application. Agents can perform actions, access data, and collaborate with each other to accomplish complex tasks within your client applications.

## How It Works

1. **Analyze Your API**: Upload your OpenAPI spec, GraphQL schema, or REST documentation
2. **Generate MCP Tools**: Analyzer agent creates custom tools tailored to your API endpoints
3. **Build MCP Server**: A custom MCP server is built with your generated tools
4. **Deploy MCP Server**: Your MCP server is deployed and ready to handle tool invocations
5. **Deploy Agent Teams**: Create specialized agents (Dev, QA, Product, Analytics, etc.) with access to specific tools
6. **Agents Work in Your App**: Agents connect to your MCP server and perform real actions
7. **Multi-Agent Collaboration**: Agents discuss, debate, and collaborate to solve problems

## Key Features

**Dual-Mode MCP Integration**
- Auto-Generated MCP: Analyzer agent parses your API docs and creates custom MCP tools
- Bring-Your-Own MCP: Connect your existing MCP server
- Automatic tool discovery and categorization by agent role
- Secure credential management with AES-256-GCM encryption

**Role-Based Agent Deployment**
- Deploy specialized agents: Dev, QA, Product, Analytics, Support, Strategy, Operations, CTO
- Each agent gets access to role-appropriate MCP tools
- Agents can perform real actions in your application through MCP
- Tool invocation logging for complete audit trails

**Multi-Agent Conversations**
- Agents discuss topics and collaborate in workspace chat
- Multiple collaboration modes: sequential, parallel, debate, brainstorm
- Agents can invoke MCP tools during conversations
- Real-time insights from agent-to-agent interactions

**Agent-to-Application Integration**
- Agents execute MCP tools to interact with your application
- Support for CRUD operations, analytics queries, testing, and more
- Tool results feed back into agent reasoning
- Complete visibility into all agent actions

**Multi-Provider Support**
- Bring your own API keys from OpenAI, Anthropic, or Google
- Different agents can use different LLM providers
- Optimize cost and performance per agent

**Comprehensive Analytics**
- Track all MCP tool invocations
- Monitor agent execution patterns
- Analyze tool usage by agent and role
- Token usage and cost tracking

**Security and Privacy**
- Encrypted API key and MCP credential storage
- JWT authentication with refresh tokens
- Role-based tool access control
- Complete audit logs of all agent actions

## Architecture

- **Backend**: Node.js + TypeScript + Express
- **MCP Integration**: Model Context Protocol SDK for tool orchestration
- **Database**: PostgreSQL with full schema (including MCP configs, tools, invocations)
- **Cache/Queue**: Redis for caching and job processing
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **AI Analysis**: OpenAI GPT-4 for API documentation analysis
- **Deployment**: Docker Compose for local dev, Vercel for production