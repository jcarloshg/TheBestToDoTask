-- Create ENUM type for priority
CREATE TYPE priority_enum AS ENUM ('low', 'medium', 'high');

-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    name VARCHAR(255) NOT NULL,
    priority priority_enum NOT NULL,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id UUID NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos (user_id);

-- Create index on completed for filtering
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos (completed);