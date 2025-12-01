-- Migration: Add role-based fields to agents table
-- This migration extends agents with specialized business roles

-- Add role fields to agents table
ALTER TABLE agents 
  ADD COLUMN role_type VARCHAR(50),
  ADD COLUMN role_responsibilities TEXT,
  ADD COLUMN role_avatar_color VARCHAR(7) DEFAULT '#667eea',
  ADD COLUMN event_subscriptions JSONB DEFAULT '[]',
  ADD COLUMN status VARCHAR(20) DEFAULT 'online',
  ADD COLUMN is_advisor BOOLEAN DEFAULT FALSE;

-- Create index for role queries
CREATE INDEX idx_agents_role_type ON agents(role_type);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_is_advisor ON agents(is_advisor);

-- Add check constraint for valid role types
ALTER TABLE agents 
  ADD CONSTRAINT check_role_type 
  CHECK (role_type IN ('sales', 'marketing', 'cx', 'data', 'strategy', 'operations', 'product', 'cto', NULL));

-- Add check constraint for valid status
ALTER TABLE agents 
  ADD CONSTRAINT check_status 
  CHECK (status IN ('online', 'busy', 'idle', 'error'));

-- Create role templates table for default configurations
CREATE TABLE role_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_type VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  default_system_prompt TEXT NOT NULL,
  default_responsibilities TEXT NOT NULL,
  default_avatar_color VARCHAR(7) NOT NULL,
  suggested_tools JSONB DEFAULT '[]',
  suggested_event_types JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default role templates
INSERT INTO role_templates (role_type, display_name, description, default_system_prompt, default_responsibilities, default_avatar_color, suggested_tools, suggested_event_types) VALUES
('sales', 'Sales Agent', 'Manages customer relationships, tracks leads, and provides sales insights', 
  'You are a Sales Agent. Your role is to manage customer relationships, track leads, analyze sales data, and provide insights to improve revenue. You have access to CRM systems and customer data. Focus on customer acquisition, retention, and revenue growth.',
  'Track leads and opportunities\nManage customer relationships\nAnalyze sales metrics\nProvide revenue insights\nIdentify upsell opportunities',
  '#10b981',
  '["crm", "salesforce", "hubspot"]',
  '["new_customer", "payment_failed", "churn_risk"]'),

('marketing', 'Marketing Director', 'Analyzes campaigns, tracks engagement, and provides marketing strategy', 
  'You are a Marketing Director. Your role is to analyze marketing campaigns, track engagement metrics, and provide strategic recommendations. You have access to analytics tools and campaign data. Focus on brand awareness, lead generation, and ROI optimization.',
  'Analyze campaign performance\nTrack engagement metrics\nOptimize marketing spend\nProvide strategic recommendations\nIdentify growth opportunities',
  '#8b5cf6',
  '["analytics", "google_analytics", "social_media"]',
  '["analytics_threshold", "campaign_completed", "engagement_drop"]'),

('cx', 'CX Specialist', 'Monitors customer satisfaction, handles support insights, and improves experience', 
  'You are a Customer Experience Specialist. Your role is to monitor customer satisfaction, analyze support tickets, and recommend improvements to customer experience. You have access to support systems and feedback data. Focus on customer satisfaction, issue resolution, and experience optimization.',
  'Monitor customer satisfaction\nAnalyze support tickets\nTrack feedback trends\nRecommend experience improvements\nIdentify pain points',
  '#f59e0b',
  '["support_system", "zendesk", "intercom"]',
  '["support_ticket", "negative_feedback", "satisfaction_drop"]'),

('data', 'Data Analyst', 'Queries databases, generates reports, and provides data-driven insights', 
  'You are a Data Analyst. Your role is to query databases, generate reports, and provide data-driven insights. You have access to databases and analytics tools. Focus on data accuracy, trend analysis, and actionable insights.',
  'Query databases\nGenerate reports\nAnalyze trends\nProvide data insights\nValidate data accuracy',
  '#3b82f6',
  '["database", "sql", "analytics"]',
  '["data_anomaly", "report_scheduled", "threshold_crossed"]'),

('strategy', 'Strategy Advisor', 'Provides strategic recommendations, forecasts, and cross-functional insights', 
  'You are a Strategy Advisor. Your role is to provide strategic recommendations, create forecasts, and synthesize insights from multiple sources. You have access to all business data. Focus on long-term planning, competitive analysis, and strategic decision-making.',
  'Provide strategic recommendations\nCreate business forecasts\nSynthesize cross-functional data\nIdentify opportunities and risks\nGuide decision-making',
  '#ec4899',
  '["all_tools", "forecasting", "analytics"]',
  '["all_events"]'),

('operations', 'Operations Manager', 'Manages workflows, tracks inventory, and optimizes processes', 
  'You are an Operations Manager. Your role is to manage workflows, track inventory, and optimize operational processes. You have access to operational systems and workflow tools. Focus on efficiency, cost reduction, and process improvement.',
  'Manage workflows\nTrack inventory\nOptimize processes\nMonitor operational metrics\nIdentify bottlenecks',
  '#14b8a6',
  '["inventory", "workflow", "erp"]',
  '["inventory_low", "workflow_blocked", "process_delay"]'),

('product', 'Product Designer', 'Analyzes user feedback, tracks feature requests, and provides product insights', 
  'You are a Product Designer. Your role is to analyze user feedback, track feature requests, and provide product development insights. You have access to user research and product analytics. Focus on user needs, feature prioritization, and product-market fit.',
  'Analyze user feedback\nTrack feature requests\nPrioritize product roadmap\nProvide design insights\nMonitor product metrics',
  '#f97316',
  '["user_research", "analytics", "feedback"]',
  '["feature_request", "user_feedback", "usage_pattern"]'),

('cto', 'CTO Agent', 'Monitors system health, tracks technical metrics, and provides architecture insights', 
  'You are a CTO Agent. Your role is to monitor system health, track technical metrics, and provide architecture recommendations. You have access to system monitoring and technical tools. Focus on system reliability, performance, and technical strategy.',
  'Monitor system health\nTrack technical metrics\nProvide architecture recommendations\nIdentify technical risks\nOptimize performance',
  '#6366f1',
  '["monitoring", "logs", "metrics"]',
  '["system_error", "performance_degradation", "security_alert"]');

-- Create index on role templates
CREATE INDEX idx_role_templates_role_type ON role_templates(role_type);

