ALTER TABLE users
    ADD COLUMN IF NOT EXISTS phone VARCHAR(32),
    ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false;

-- Mark all existing users as verified (they were registered before verification was required)
UPDATE users SET verified = true WHERE verified = false AND deleted_at IS NULL;
