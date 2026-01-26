-- Drop existing tables if needed
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS diary_edit_permissions CASCADE;
DROP TABLE IF EXISTS requests CASCADE;
DROP TABLE IF EXISTS diaries CASCADE;
DROP TABLE IF EXISTS partner_relationships CASCADE;
DROP TABLE IF EXISTS partner_profiles CASCADE;
DROP TABLE IF EXISTS lawyer_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (matches app structure)
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('lawyer', 'partner')),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    profile_photo TEXT,
    enrollment_number TEXT,
    bar_council TEXT,
    practice_areas TEXT,
    years_of_experience INTEGER,
    court_preferences TEXT,
    practice_details TEXT,
    organization TEXT,
    designation TEXT,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Diaries table (matches app structure)
CREATE TABLE diaries (
    id TEXT PRIMARY KEY,
    lawyer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    matter_date TEXT NOT NULL,
    court_name TEXT NOT NULL,
    case_type TEXT NOT NULL,
    case_number TEXT,
    party_names TEXT NOT NULL,
    stage_of_case TEXT,
    purpose_of_hearing TEXT NOT NULL,
    notes TEXT,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Partner relationships
CREATE TABLE partner_relationships (
    id TEXT PRIMARY KEY,
    lawyer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    partner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'removed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lawyer_id, partner_id)
);

-- Requests
CREATE TABLE requests (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('partner_request', 'edit_request')),
    sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    diary_id TEXT REFERENCES diaries(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Edit permissions
CREATE TABLE diary_edit_permissions (
    id TEXT PRIMARY KEY,
    diary_id TEXT NOT NULL REFERENCES diaries(id) ON DELETE CASCADE,
    partner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    can_edit BOOLEAN DEFAULT true,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by TEXT NOT NULL REFERENCES users(id),
    UNIQUE(diary_id, partner_id)
);

-- Audit logs
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY,
    action_type TEXT NOT NULL,
    performed_by TEXT NOT NULL,
    target_entity TEXT NOT NULL,
    target_id TEXT,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_diaries_lawyer ON diaries(lawyer_id);
CREATE INDEX idx_diaries_date ON diaries(matter_date);
CREATE INDEX idx_requests_receiver ON requests(receiver_id);
CREATE INDEX idx_requests_sender ON requests(sender_id);
