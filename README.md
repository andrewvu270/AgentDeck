# AgentDeck

A multi-agent orchestration platform for creating, managing, and gaining insights from specialized AI agents.

## Overview

AgentDeck enables you to build a portfolio of specialized AI agents, each configured with unique system prompts and expertise. By creating agents tailored to specific domains or analytical tasks, you can gain deeper insights than using generic chatbots. Execute conversations with different agents, compare their perspectives, and track insights over time through comprehensive execution history.

## Key Features

**Insight Generation Through Specialized Agents**
- Create agents with custom system prompts for specific domains (code analysis, business strategy, data interpretation, creative writing)
- Execute conversations and extract targeted insights based on agent expertise
- Compare responses across multiple agents to gain diverse perspectives
- Build conversation history to develop deeper, contextual insights over time

**Multi-Agent Conversations**
- Discuss topics with multiple agents simultaneously to gather diverse viewpoints
- Enable agents to talk with each other, creating dynamic multi-perspective discussions
- Facilitate agent-to-agent debates and collaborative problem-solving
- Synthesize insights from group conversations where agents build on each other's responses

**Multi-Agent Management**
- Configure multiple agents with different LLM models and providers
- Design agent portfolios for comprehensive insight coverage
- Track execution history to identify patterns and refine agent configurations
- Organize agents by use case, domain, or analytical approach

**Provider Flexibility**
- Bring your own API keys from OpenAI, Anthropic, or Google
- Switch between providers and models per agent
- Optimize cost and performance by selecting appropriate models for each task

**Execution Analytics**
- Monitor all agent interactions with detailed execution logs
- Track token usage and costs per execution
- Analyze response patterns across different agents and prompts
- Review historical executions to measure insight quality over time

**Security and Privacy**
- Encrypted API key storage using AES-256-GCM
- JWT authentication with refresh tokens
- Your keys and data remain under your control

## Architecture

- **Backend**: Node.js + TypeScript + Express
- **Database**: PostgreSQL with full schema
- **Cache/Queue**: Redis for caching and job processing
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Deployment**: TBA