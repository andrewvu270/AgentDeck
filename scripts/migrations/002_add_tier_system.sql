-- Migration: Add subscription tier system
-- This migration creates tables for managing subscription tiers and usage tracking

-- Create tiers table with limits
CREATE TABLE tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  max_agents INTEGER NOT NULL,
  available_roles JSONB NOT NULL DEFAULT '[]',
  max_event_hooks INTEGER NOT NULL,
  max_collaboration_tables INTEGER NOT NULL,
  advisor_agent_level VARCHAR(20) NOT NULL DEFAULT 'none',
  memory_size_bytes BIGINT NOT NULL,
  analytics_level VARCHAR(20) NOT NULL DEFAULT 'basic',
  token_budget_monthly INTEGER NOT NULL,
  price_monthly_usd DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add check constraint for advisor levels
ALTER TABLE tiers 
  ADD CONSTRAINT check_advisor_level 
  CHECK (advisor_agent_level IN ('none', 'basic', 'advanced', 'full'));

-- Add check constraint for analytics levels
ALTER TABLE tiers 
  ADD CONSTRAINT check_analytics_level 
  CHECK (analytics_level IN ('basic', 'standard', 'advanced', 'custom'));

-- Insert default tier configurations
INSERT INTO tiers (name, display_name, description, max_agents, available_roles, max_event_hooks, max_collaboration_tables, advisor_agent_level, memory_size_bytes, analytics_level, token_budget_monthly, price_monthly_usd) VALUES
('free', 'Free', 'Perfect for trying out AgentDeck', 
  2, 
  '["sales", "marketing"]'::jsonb,
  0,
  1,
  'none',
  104857600, -- 100 MB
  'basic',
  10000,
  0),

('starter', 'Starter', 'For small teams getting started with AI agents', 
  5, 
  '["sales", "marketing", "cx", "data"]'::jsonb,
  5,
  3,
  'basic',
  524288000, -- 500 MB
  'standard',
  100000,
  29),

('professional', 'Professional', 'For growing teams with advanced needs', 
  15, 
  '["sales", "marketing", "cx", "data", "strategy", "operations", "product", "cto"]'::jsonb,
  20,
  10,
  'advanced',
  2147483648, -- 2 GB
  'advanced',
  500000,
  99),

('enterprise', 'Enterprise', 'Unlimited power for large organizations', 
  999999, 
  '["sales", "marketing", "cx", "data", "strategy", "operations", "product", "cto"]'::jsonb,
  999999,
  999999,
  'full',
  10737418240, -- 10 GB
  'custom',
  999999999,
  299);

-- Add tier_id to users table
ALTER TABLE users 
  ADD COLUMN tier_id UUID REFERENCES tiers(id),
  ADD COLUMN tier_started_at TIMESTAMP DEFAULT NOW();

-- Set all existing users to free tier
UPDATE users 
SET tier_id = (SELECT id FROM tiers WHERE name = 'free' LIMIT 1)
WHERE tier_id IS NULL;

-- Make tier_id NOT NULL after setting defaults
ALTER TABLE users 
  ALTER COLUMN tier_id SET NOT NULL;

-- Create user_tier_usage table to track current usage
CREATE TABLE user_tier_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  agents_count INTEGER DEFAULT 0,
  event_hooks_count INTEGER DEFAULT 0,
  collaboration_tables_active INTEGER DEFAULT 0,
  memory_used_bytes BIGINT DEFAULT 0,
  tokens_used_monthly INTEGER DEFAULT 0,
  last_reset_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create usage for all existing users
INSERT INTO user_tier_usage (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;

-- Create tier_usage_history table for analytics
CREATE TABLE tier_usage_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tier_id UUID REFERENCES tiers(id),
  resource_type VARCHAR(50) NOT NULL,
  amount INTEGER NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_tiers_name ON tiers(name);
CREATE INDEX idx_users_tier_id ON users(tier_id);
CREATE INDEX idx_user_tier_usage_user_id ON user_tier_usage(user_id);
CREATE INDEX idx_tier_usage_history_user_id ON tier_usage_history(user_id);
CREATE INDEX idx_tier_usage_history_timestamp ON tier_usage_history(timestamp DESC);

-- Create function to update usage counts
CREATE OR REPLACE FUNCTION update_tier_usage_count(
  p_user_id UUID,
  p_resource_type VARCHAR(50),
  p_delta INTEGER
) RETURNS VOID AS $$
BEGIN
  -- Update the appropriate counter
  CASE p_resource_type
    WHEN 'agents' THEN
      UPDATE user_tier_usage 
      SET agents_count = agents_count + p_delta, updated_at = NOW()
      WHERE user_id = p_user_id;
    WHEN 'event_hooks' THEN
      UPDATE user_tier_usage 
      SET event_hooks_count = event_hooks_count + p_delta, updated_at = NOW()
      WHERE user_id = p_user_id;
    WHEN 'collaboration_tables' THEN
      UPDATE user_tier_usage 
      SET collaboration_tables_active = collaboration_tables_active + p_delta, updated_at = NOW()
      WHERE user_id = p_user_id;
    WHEN 'tokens' THEN
      UPDATE user_tier_usage 
      SET tokens_used_monthly = tokens_used_monthly + p_delta, updated_at = NOW()
      WHERE user_id = p_user_id;
    WHEN 'memory' THEN
      UPDATE user_tier_usage 
      SET memory_used_bytes = memory_used_bytes + p_delta, updated_at = NOW()
      WHERE user_id = p_user_id;
  END CASE;
  
  -- Record in history
  INSERT INTO tier_usage_history (user_id, tier_id, resource_type, amount)
  VALUES (
    p_user_id,
    (SELECT tier_id FROM users WHERE id = p_user_id),
    p_resource_type,
    p_delta
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to check if user can perform action
CREATE OR REPLACE FUNCTION can_perform_action(
  p_user_id UUID,
  p_resource_type VARCHAR(50)
) RETURNS BOOLEAN AS $$
DECLARE
  v_tier_limit INTEGER;
  v_current_usage INTEGER;
BEGIN
  -- Get tier limit and current usage
  SELECT 
    CASE p_resource_type
      WHEN 'agents' THEN t.max_agents
      WHEN 'event_hooks' THEN t.max_event_hooks
      WHEN 'collaboration_tables' THEN t.max_collaboration_tables
      ELSE 999999
    END,
    CASE p_resource_type
      WHEN 'agents' THEN u.agents_count
      WHEN 'event_hooks' THEN u.event_hooks_count
      WHEN 'collaboration_tables' THEN u.collaboration_tables_active
      ELSE 0
    END
  INTO v_tier_limit, v_current_usage
  FROM users usr
  JOIN tiers t ON usr.tier_id = t.id
  JOIN user_tier_usage u ON u.user_id = usr.id
  WHERE usr.id = p_user_id;
  
  -- Check if under limit
  RETURN v_current_usage < v_tier_limit;
END;
$$ LANGUAGE plpgsql;

