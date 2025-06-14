-- Agents table indexes
CREATE INDEX idx_agents_creator_id ON agents(creator_id);

-- Agent Subscriptions table indexes
CREATE INDEX idx_agent_subscriptions_agent_id ON agent_subscriptions(agent_id);
CREATE INDEX idx_agent_subscriptions_user_id ON agent_subscriptions(user_id);

-- Models table indexes
CREATE INDEX idx_models_creator_id ON models(creator_id);

-- Model Subscriptions table indexes
CREATE INDEX idx_model_subscriptions_model_id ON model_subscriptions(model_id);
CREATE INDEX idx_model_subscriptions_user_id ON model_subscriptions(user_id);

-- Conversations table indexes
CREATE INDEX idx_conversations_creator_id ON conversations(creator_id);

-- Conversation Participants table indexes
CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);

-- Messages table indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_agent_id ON messages(agent_id);
CREATE INDEX idx_messages_model_id ON messages(model_id);

-- Composite indexes for subscription lookups
CREATE INDEX idx_agent_subscriptions_lookup ON agent_subscriptions(agent_id, user_id);
CREATE INDEX idx_model_subscriptions_lookup ON model_subscriptions(model_id, user_id);
CREATE INDEX idx_conversation_participants_lookup ON conversation_participants(conversation_id, user_id);

-- Indexes for filtering and sorting (if you have created_at, updated_at columns)
-- Uncomment these if you have timestamp columns
-- CREATE INDEX idx_agents_created_at ON agents(created_at);
-- CREATE INDEX idx_models_created_at ON models(created_at);
-- CREATE INDEX idx_conversations_created_at ON conversations(created_at);
-- CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Indexes for text search (if you need to search by name or content)
-- Uncomment and modify these based on your actual text search needs
-- CREATE INDEX idx_agents_name ON agents(name);
-- CREATE INDEX idx_models_name ON models(name);
-- CREATE INDEX idx_users_name ON users(name);

-- Performance indexes for filtering operations
CREATE INDEX idx_messages_conversation_type ON messages(conversation_id, type);
CREATE INDEX idx_agents_visibility ON agents(visibility);
CREATE INDEX idx_models_visibility ON models(visibility);