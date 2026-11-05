-- ====================================================================
-- CHAT MODULE MIGRATION V2 (crm_db)
-- Add partial unique index for single active owner per group
-- ====================================================================

CREATE UNIQUE INDEX IF NOT EXISTS uk_chat_group_single_active_owner 
    ON chat_participants(conversation_id) 
    WHERE role = 'OWNER' AND status = 'ACTIVE';

