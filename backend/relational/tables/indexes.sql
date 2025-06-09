-- User-related indexes
CREATE INDEX idx_users_updated_at ON users(updated_at);

-- Conversation-related indexes
CREATE INDEX idx_conversations_creator_id ON conversations(creator_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at);

-- Message-related indexes
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_agent_id ON messages(agent_id);
CREATE INDEX idx_messages_model_id ON messages(model_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_type ON messages(type);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_updated_at ON messages(updated_at);

-- Agent-related indexes
CREATE INDEX idx_agents_creator_id ON agents(creator_id);
CREATE INDEX idx_agents_name ON agents(name);
CREATE INDEX idx_agents_updated_at ON agents(updated_at);

-- Model-related indexes
CREATE INDEX idx_models_creator_id ON models(creator_id);
CREATE INDEX idx_models_name ON models(name);
CREATE INDEX idx_models_provider ON models(llm_model);
CREATE INDEX idx_models_updated_at ON models(updated_at);

-- Conversation participants indexes
CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);
-- Note: conversation_id is already part of the primary key

-- Agent subscriptions indexes
CREATE INDEX idx_agents_creator_visibility ON agents(creator_id, visibility);
CREATE INDEX idx_agent_subscriptions_agent_id ON agent_subscriptions(agent_id);

-- Model subscriptions indexes
CREATE INDEX idx_models_creator_visibility ON models(creator_id, visibility);
CREATE INDEX idx_model_subscriptions_model_id ON model_subscriptions(model_id);

-- Composite indexes for common query patterns
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at);
CREATE INDEX idx_conversation_participants_role ON conversation_participants(conversation_id, user_id, role);