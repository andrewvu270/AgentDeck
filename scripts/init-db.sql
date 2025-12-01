-- AgentDeck Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- API Keys table (for user's LLM provider keys)
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  encrypted_key TEXT NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP,
  UNIQUE(user_id, provider, name)
);

-- Agents table
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  model VARCHAR(100) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  system_prompt TEXT NOT NULL,
  tools JSONB DEFAULT '[]',
  config JSONB DEFAULT '{}',
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Agent versions (for rollback)
CREATE TABLE agent_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  config JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(agent_id, version)
);

-- Tools table
CREATE TABLE tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  parameters JSONB NOT NULL,
  handler_type VARCHAR(50) NOT NULL,
  handler_config JSONB NOT NULL,
  timeout_ms INTEGER DEFAULT 30000,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Executions table
CREATE TABLE executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  input TEXT NOT NULL,
  output TEXT,
  status VARCHAR(50) NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  cost_usd DECIMAL(10, 6) DEFAULT 0,
  latency_ms INTEGER,
  tools_called JSONB DEFAULT '[]',
  error JSONB,
  trace JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_executions_user_id ON executions(user_id);
CREATE INDEX idx_executions_agent_id ON executions(agent_id);
CREATE INDEX idx_executions_created_at ON executions(created_at DESC);
CREATE INDEX idx_executions_status ON executions(status);

-- Workflows table
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  steps JSONB NOT NULL,
  error_handling JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Workflow executions table
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  current_step INTEGER DEFAULT 0,
  output JSONB,
  trace JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Usage limits table
CREATE TABLE usage_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  limit_type VARCHAR(50) NOT NULL,
  token_limit INTEGER NOT NULL,
  current_usage INTEGER DEFAULT 0,
  reset_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, agent_id, limit_type)
);

-- User sessions table (for JWT refresh tokens)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  refresh_token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_tools_user_id ON tools(user_id);
CREATE INDEX idx_workflows_user_id ON workflows(user_id);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_refresh_token ON sessions(refresh_token);
