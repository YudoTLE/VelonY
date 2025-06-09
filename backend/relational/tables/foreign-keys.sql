-- ############################### --
-- # THIS SHOULD BE APPLIED LAST # --
-- ############################### --


-- USERS
ALTER TABLE users
ADD CONSTRAINT fk_users_auth
FOREIGN KEY (id)
REFERENCES auth.users(id)
ON DELETE CASCADE;


-- CONVERSATIONS
ALTER TABLE conversations
ADD CONSTRAINT fk_conversations_creator 
FOREIGN KEY (creator_id)
REFERENCES users(id)
ON DELETE SET NULL;


-- MESSAGES
ALTER TABLE messages
ADD CONSTRAINT fk_messages_sender
FOREIGN KEY (sender_id)
REFERENCES users(id)
ON DELETE SET NULL;

ALTER TABLE messages
ADD CONSTRAINT fk_messages_conversation
FOREIGN KEY (conversation_id)
REFERENCES conversations(id)
ON DELETE CASCADE;

ALTER TABLE messages
ADD CONSTRAINT fk_messages_agent
FOREIGN KEY (agent_id)
REFERENCES agents(id)
ON DELETE SET NULL;

ALTER TABLE messages
ADD CONSTRAINT fk_messages_model
FOREIGN KEY (model_id)
REFERENCES models(id)
ON DELETE SET NULL;


-- AGENTS
ALTER TABLE agents
ADD CONSTRAINT fk_agents_creator 
FOREIGN KEY (creator_id)
REFERENCES users(id)
ON DELETE CASCADE;


-- MODELS
ALTER TABLE models
ADD CONSTRAINT fk_models_creator 
FOREIGN KEY (creator_id)
REFERENCES users(id)
ON DELETE CASCADE;


-- CONVERSATION PARITCIPANTS
ALTER TABLE conversation_participants
ADD CONSTRAINT fk_conversation_participants_conversation
FOREIGN KEY (conversation_id)
REFERENCES conversations(id)
ON DELETE CASCADE;

ALTER TABLE conversation_participants
ADD CONSTRAINT fk_conversation_participants_user
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;


-- AGENT SUBSCRIPTIONS
ALTER TABLE agent_subscriptions
ADD CONSTRAINT fk_agent_subscriptions_user
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

ALTER TABLE agent_subscriptions
ADD CONSTRAINT fk_agent_subscriptions_agent
FOREIGN KEY (agent_id)
REFERENCES agents(id)
ON DELETE CASCADE;


-- MODEL SUBSCRIPTIONS
ALTER TABLE model_subscriptions
ADD CONSTRAINT fk_model_subscriptions_user
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

ALTER TABLE model_subscriptions
ADD CONSTRAINT fk_model_subscriptions_model
FOREIGN KEY (model_id)
REFERENCES models(id)
ON DELETE CASCADE;