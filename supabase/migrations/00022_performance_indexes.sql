-- Performance indexes for group_members (used heavily in RLS policies)
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_user ON group_members(group_id, user_id);

-- Performance indexes for group_rooms
CREATE INDEX IF NOT EXISTS idx_group_rooms_group ON group_rooms(group_id);

-- Performance indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_actor ON notifications(actor_id);

-- Performance index for pinned posts
CREATE INDEX IF NOT EXISTS idx_posts_pinned ON posts(is_pinned, category_id, created_at DESC);

-- Performance index for direct_messages conversation lookup
CREATE INDEX IF NOT EXISTS idx_direct_messages_conversation ON direct_messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_direct_messages_unread ON direct_messages(conversation_id, sender_id, is_read);
