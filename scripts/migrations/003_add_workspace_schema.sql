-- Migration: Add workspace collaboration schema
-- This migration creates tables for conversations, messages, collaboration tables, and advisor features

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255),
  mode VARCHAR(50) NOT NULL DEFAULT 'sequential',
  max_rounds INTEGER NOT NULL DEFAULT 3,
  token_budget INTEGER NOT NULL DEFAULT 10000,
  participating_agents UUID[] NOT NULL DEFAULT '{}',
  total_tokens INTEGER NOT NULL DEFAULT 0,
  total_cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
  message_count INTEGER NOT NULL DEFAULT 0,
  tool_call_count INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  archived_at TIMESTAMP
);

-- Add check constraint for mode
ALTER TABLE conversations 
  ADD CONSTRAINT check_conversation_mode 
  CHECK (mode IN ('sequential', 'parallel', 'debate', 'brainstorm', 'review'));

-- Add check constraint for status
ALTER TABLE conversations 
  ADD CONSTRAINT check_conversation_status 
  CHECK (status IN ('active', 'paused', 'completed', 'archived'));

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_type VARCHAR(20) NOT NULL,
  sender_id UUID NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  sender_role VARCHAR(50),
  content TEXT NOT NULL,
  message_type VARCHAR(50) NOT NULL DEFAULT 'normal',
  tokens INTEGER NOT NULL DEFAULT 0,
  response_time INTEGER,
  mentions UUID[],
  reply_to UUID REFERENCES messages(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add check constraint for sender type
ALTER TABLE messages 
  ADD CONSTRAINT check_sender_type 
  CHECK (sender_type IN ('user', 'agent', 'system'));

-- Add check constraint for message type
ALTER TABLE messages 
  ADD CONSTRAINT check_message_type 
  CHECK (message_type IN ('normal', 'status', 'insight', 'error', 'question', 'recommendation'));

-- Tool calls table (updated from existing tools table)
CREATE TABLE tool_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  tool_id UUID REFERENCES tools(id) NOT NULL,
  tool_name VARCHAR(255) NOT NULL,
  parameters JSONB NOT NULL DEFAULT '{}',
  response_data JSONB,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  duration INTEGER,
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add check constraint for tool call status
ALTER TABLE tool_calls 
  ADD CONSTRAINT check_tool_call_status 
  CHECK (status IN ('pending', 'running', 'success', 'error'));

-- Event subscriptions table
CREATE TABLE event_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  filters JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(agent_id, event_type)
);

-- Business events table
CREATE TABLE business_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  source VARCHAR(255) NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  triggered_agents UUID[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Collaboration tables
CREATE TABLE collaboration_tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  topic TEXT NOT NULL,
  desired_outcome TEXT NOT NULL,
  participating_agents UUID[] NOT NULL,
  current_phase VARCHAR(50) NOT NULL DEFAULT 'data_gathering',
  token_budget INTEGER NOT NULL DEFAULT 10000,
  time_limit_minutes INTEGER,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  conversation_id UUID REFERENCES conversations(id),
  output_summary TEXT,
  output_recommendations JSONB DEFAULT '[]',
  output_action_items JSONB DEFAULT '[]',
  output_dissenting_opinions JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Add check constraint for phase
ALTER TABLE collaboration_tables 
  ADD CONSTRAINT check_collaboration_phase 
  CHECK (current_phase IN ('data_gathering', 'analysis', 'debate', 'recommendation'));

-- Add check constraint for status
ALTER TABLE collaboration_tables 
  ADD CONSTRAINT check_collaboration_status 
  CHECK (status IN ('active', 'paused', 'completed', 'cancelled'));

-- Advisor summaries table
CREATE TABLE advisor_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  time_range_start TIMESTAMP NOT NULL,
  time_range_end TIMESTAMP NOT NULL,
  executive_summary TEXT NOT NULL,
  key_insights JSONB DEFAULT '[]',
  priority_alerts JSONB DEFAULT '[]',
  forecasts JSONB DEFAULT '[]',
  strategic_recommendations JSONB DEFAULT '[]',
  agent_activity_overview JSONB DEFAULT '[]',
  conflicts JSONB DEFAULT '[]',
  generated_at TIMESTAMP DEFAULT NOW()
);

-- Message ratings table
CREATE TABLE message_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating IN (-1, 1)),
  feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add check constraint for notification type
ALTER TABLE notifications 
  ADD CONSTRAINT check_notification_type 
  CHECK (type IN ('mention', 'alert', 'event', 'advisor', 'system'));

-- Create indexes for performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_mentions ON messages USING GIN(mentions);

CREATE INDEX idx_tool_calls_message_id ON tool_calls(message_id);
CREATE INDEX idx_tool_calls_tool_id ON tool_calls(tool_id);
CREATE INDEX idx_tool_calls_status ON tool_calls(status);

CREATE INDEX idx_event_subscriptions_agent_id ON event_subscriptions(agent_id);
CREATE INDEX idx_event_subscriptions_event_type ON event_subscriptions(event_type);

CREATE INDEX idx_business_events_user_id ON business_events(user_id);
CREATE INDEX idx_business_events_event_type ON business_events(event_type);
CREATE INDEX idx_business_events_created_at ON business_events(created_at DESC);

CREATE INDEX idx_collaboration_tables_user_id ON collaboration_tables(user_id);
CREATE INDEX idx_collaboration_tables_status ON collaboration_tables(status);

CREATE INDEX idx_advisor_summaries_user_id ON advisor_summaries(user_id);
CREATE INDEX idx_advisor_summaries_generated_at ON advisor_summaries(generated_at DESC);

CREATE INDEX idx_message_ratings_message_id ON message_ratings(message_id);
CREATE INDEX idx_message_ratings_user_id ON message_ratings(user_id);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Create function to update conversation metadata
CREATE OR REPLACE FUNCTION update_conversation_metadata()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE conversations 
    SET 
      message_count = message_count + 1,
      total_tokens = total_tokens + NEW.tokens,
      updated_at = NOW()
    WHERE id = NEW.conversation_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update conversation metadata
CREATE TRIGGER trigger_update_conversation_metadata
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_metadata();

-- Create function to auto-archive old conversations
CREATE OR REPLACE FUNCTION auto_archive_old_conversations()
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  UPDATE conversations
  SET status = 'archived', archived_at = NOW()
  WHERE status = 'active'
    AND updated_at < NOW() - INTERVAL '30 days'
    AND archived_at IS NULL;
  
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type VARCHAR(50),
  p_title VARCHAR(255),
  p_message TEXT,
  p_data JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

