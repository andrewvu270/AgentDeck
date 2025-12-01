-- Migration: Add MCP Tool Invocations
-- Description: Create table for logging MCP tool invocations by agents

-- MCP Tool Invocations (for logging and analytics)
CREATE TABLE IF NOT EXISTS mcp_tool_invocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  tool_name VARCHAR(255) NOT NULL,
  parameters JSONB,
  result JSONB,
  error TEXT,
  duration_ms INTEGER,
  status VARCHAR(20) NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'error', 'timeout')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_mcp_tool_invocations_agent ON mcp_tool_invocations(agent_id);
CREATE INDEX idx_mcp_tool_invocations_tool_name ON mcp_tool_invocations(tool_name);
CREATE INDEX idx_mcp_tool_invocations_created ON mcp_tool_invocations(created_at DESC);
CREATE INDEX idx_mcp_tool_invocations_status ON mcp_tool_invocations(status);

-- Add comments for documentation
COMMENT ON TABLE mcp_tool_invocations IS 'Logs all MCP tool invocations by agents for analytics and debugging';
COMMENT ON COLUMN mcp_tool_invocations.tool_name IS 'Name of the MCP tool that was invoked';
COMMENT ON COLUMN mcp_tool_invocations.parameters IS 'JSON object of parameters passed to the tool';
COMMENT ON COLUMN mcp_tool_invocations.result IS 'JSON object of the tool execution result';
COMMENT ON COLUMN mcp_tool_invocations.error IS 'Error message if the tool invocation failed';
COMMENT ON COLUMN mcp_tool_invocations.duration_ms IS 'Tool execution duration in milliseconds';
COMMENT ON COLUMN mcp_tool_invocations.status IS 'Invocation status: success, error, or timeout';
