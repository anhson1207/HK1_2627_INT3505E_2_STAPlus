-- ====================================================================
-- CHAT-SERVICE DATABASE SCHEMA (chat_db)
-- Independent Chat Microservice schema without foreign keys to auth.users
-- ====================================================================

-- 1. Bảng hội thoại
CREATE TABLE IF NOT EXISTS chat_conversations (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL DEFAULT 'DIRECT',
    direct_key VARCHAR(64) UNIQUE,
    name VARCHAR(255),
    avatar_url VARCHAR(500),
    creator_id BIGINT,
    last_message_id BIGINT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng thành viên hội thoại (kèm username và email snapshot)
CREATE TABLE IF NOT EXISTS chat_participants (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL,
    username VARCHAR(100),
    email VARCHAR(255),
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
    sender_id BIGINT,
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

-- 4. Bảng tệp đính kèm
CREATE TABLE IF NOT EXISTS chat_attachments (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    uploader_id BIGINT,
    original_filename VARCHAR(255) NOT NULL,
    storage_filename VARCHAR(255) NOT NULL UNIQUE,
    content_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Chỉ mục tối ưu hóa hiệu năng
CREATE INDEX IF NOT EXISTS idx_chat_conversations_last_msg 
    ON chat_conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_participants_user 
    ON chat_participants(user_id, status);

CREATE UNIQUE INDEX IF NOT EXISTS uk_chat_group_single_active_owner 
    ON chat_participants(conversation_id) 
    WHERE role = 'OWNER' AND status = 'ACTIVE';

CREATE INDEX IF NOT EXISTS idx_chat_messages_cursor 
    ON chat_messages(conversation_id, id DESC);

CREATE INDEX IF NOT EXISTS idx_chat_attachments_conv 
    ON chat_attachments(conversation_id);

