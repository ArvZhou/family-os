-- Clear orphaned members (no user isolation existed before this migration)
DELETE FROM members;

-- Add user_id column for multi-tenant data isolation
ALTER TABLE members ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL;

-- Foreign key to users table
ALTER TABLE members ADD CONSTRAINT fk_members_user FOREIGN KEY (user_id) REFERENCES users(id);

-- Index for efficient per-user queries
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);
