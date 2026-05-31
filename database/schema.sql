CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE role_enum AS ENUM (
    'principal_investigator',
    'supervisor',
    'reviewer',
    'postdoc',
    'phd_student',
    'co_author',
    'designer',
    'observer'
);

CREATE TYPE message_type_enum AS ENUM (
    'chat',
    'feedback',
    'suggestion',
    'approval',
    'objection',
    'system'
);

CREATE TYPE change_category_enum AS ENUM (
    'improvement',
    'neutral',
    'potentially_degrading',
    'structural_change'
);

CREATE TYPE consensus_status_enum AS ENUM (
    'pending',
    'auto_approved',
    'pending_vote',
    'accepted',
    'rejected'
);

CREATE TYPE project_status_enum AS ENUM ('active', 'archived');
CREATE TYPE instruction_status_enum AS ENUM ('pending', 'applied', 'rejected');
CREATE TYPE decision_status_enum AS ENUM ('accepted', 'rejected', 'pending');
CREATE TYPE vote_type_enum AS ENUM ('upvote', 'downvote');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    hashed_password TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    invite_token UUID DEFAULT gen_random_uuid() UNIQUE,
    room_password_hash TEXT NOT NULL,
    status project_status_enum DEFAULT 'active',
    auto_approve_window_minutes INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role role_enum NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE room_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role role_enum NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    message_type message_type_enum DEFAULT 'chat',
    parent_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    change_category change_category_enum,
    consensus_status consensus_status_enum DEFAULT 'pending',
    vote_deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vote_type vote_type_enum NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

CREATE TABLE instructions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    instruction_type VARCHAR(50) NOT NULL,
    target VARCHAR(200),
    action VARCHAR(200),
    payload JSONB DEFAULT '{}',
    status instruction_status_enum DEFAULT 'pending',
    source_message_ids JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    instruction_id UUID REFERENCES instructions(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    status decision_status_enum DEFAULT 'pending',
    decided_at TIMESTAMPTZ,
    decided_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_room_id ON messages(room_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_votes_message_id ON votes(message_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_room_members_room_id ON room_members(room_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_project_id ON audit_logs(project_id);
CREATE INDEX idx_instructions_project_id ON instructions(project_id);
