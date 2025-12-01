-- Migration: Update Agents Table for MCP
-- Description: Add MCP-related columns to agents table

-- Add MCP tool access columns to agents table
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS mcp_tools TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS mcp_config_id UUID REFERENCES mcp_configs(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_agents_mcp_config ON agents(mcp_config_id);

-- Add comments for documentation
COMMENT ON COLUMN agents.mcp_tools IS 'Array of MCP tool names this agent can access';
COMMENT ON COLUMN agents.mcp_config_id IS 'Reference to the MCP configuration this agent uses';
