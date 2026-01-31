-- Enable UUID extension for PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL, -- SHA256 Hash

-- Security & Rotation Columns
parent_id BIGINT REFERENCES refresh_tokens (id), -- Points to the token that created this one (The Family)
is_revoked BOOLEAN DEFAULT FALSE,
revoked_at TIMESTAMP,
replaced_by_token_hash VARCHAR(64), -- Helps track the chain of theft

-- Metadata
expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    created_ip INET,      -- Useful for security audits
    user_agent TEXT       -- Useful to show users "Active Sessions" (e.g., "Chrome on Windows")
);

-- Index for fast lookups during the refresh flow
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens (token_hash);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens (user_id);