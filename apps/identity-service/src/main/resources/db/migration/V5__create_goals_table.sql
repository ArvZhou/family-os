CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    member_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(32) NOT NULL,
    target_value NUMERIC(18, 2) NOT NULL,
    current_value NUMERIC(18, 2) NOT NULL DEFAULT 0,
    unit VARCHAR(64) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(32) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_member_id ON goals(member_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_goals_end_date ON goals(end_date) WHERE deleted_at IS NULL;
