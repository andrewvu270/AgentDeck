-- Migration: Add MCP Tools
-- Description: Create table for MCP tool definitions and caching

-- MCP Tools table (for caching and quick lookup)
CREATE TABLE IF NOT EXISTS mcp_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mcp_config_id UUID NOT NULL REFERENCES mcp_configs(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  input_schema JSONB NOT NULL,
  output_schema JSONB,
  roles TEXT[] DEFAULT '{}',
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_mcp_tool UNIQUE(mcp_config_id, name)
);

-- Create indexes for faster lookups
CREATE INDEX idx_mcp_tools_config_id ON mcp_tools(mcp_config_id);
CREATE INDEX idx_mcp_tools_name ON mcp_tools(name);
CREATE INDEX idx_mcp_tools_category ON mcp_tools(category);
CREATE INDEX idx_mcp_tools_roles ON mcp_tools USING GIN(roles);

-- Add comments for documentation
COMMENT ON TABLE mcp_tools IS 'Stores MCP tool definitions for quick lookup and caching';
COMMENT ON COLUMN mcp_tools.name IS 'Unique tool name within an MCP configuration';
COMMENT ON COLUMN mcp_tools.input_schema IS 'JSON Schema for tool input parameters';
COMMENT ON COLUMN mcp_tools.output_schema IS 'JSON Schema for tool output';
COMMENT ON COLUMN mcp_tools.roles IS 'Array of agent roles that can use this tool (e.g., Dev, QA, Product)';
COMMENT ON COLUMN mcp_tools.category IS 'Tool category for organization (e.g., Dev, QA, Analytics)';
