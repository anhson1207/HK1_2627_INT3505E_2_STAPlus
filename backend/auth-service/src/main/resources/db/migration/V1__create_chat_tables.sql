-- ====================================================================
-- CHAT MODULE MIGRATION (crm_db)
-- Supports both DIRECT (1-1) and GROUP (Group Chat)
-- ====================================================================

-- 1. Bảng hội thoại
CREATE TABLE IF NOT EXISTS chat_conversations (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL DEFAULT 'DIRECT',
    direct_key VARCHAR(64) UNIQUE,
    name VARCHAR(255),
    avatar_url VARCHAR(500),
    creator_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    last_message_id BIGINT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng thành viên hội thoại
CREATE TABLE IF NOT EXISTS chat_participants (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    last_read_message_id BIGINT DEFAULT 0,
    last_read_at TIMESTAMP WITH TIME ZONE,
    visible_from_message_id BIGINT DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uk_chat_participant UNIQUE (conversation_id, user_id)
);

-- 3. Bảng tin nhắn
CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    sender_name VARCHAR(100),
    type VARCHAR(20) NOT NULL DEFAULT 'TEXT',
    content TEXT NOT NULL,
    attachment_url VARCHAR(500),
    attachment_name VARCHAR(255),
    attachment_size BIGINT,
    client_message_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_chat_messages_client_id UNIQUE (conversation_id, client_message_id)
);

-- 4. Chỉ mục tối ưu hóa hiệu năng
CREATE INDEX IF NOT EXISTS idx_chat_messages_cursor 
    ON chat_messages(conversation_id, id DESC);

CREATE INDEX IF NOT EXISTS idx_chat_participants_user 
    ON chat_participants(user_id, status);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_last_msg 
    ON chat_conversations(last_message_at DESC);
