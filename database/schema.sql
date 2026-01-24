-- Legal Diary Database Schema
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role VARCHAR(20) NOT NULL CHECK (role IN ('lawyer', 'partner')),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    profile_photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- Lawyer profiles (sensitive data)
CREATE TABLE lawyer_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    enrollment_number BYTEA NOT NULL, -- Encrypted
    bar_council VARCHAR(255),
    practice_areas TEXT[],
    years_of_experience INTEGER,
    court_preferences TEXT[],
    practice_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lawyer_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Partner profiles
CREATE TABLE partner_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    organization VARCHAR(255),
    designation VARCHAR(255),
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_partner_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Partner relationships
CREATE TABLE partner_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lawyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'accepted', 'removed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lawyer_id, partner_id),
    CONSTRAINT fk_lawyer FOREIGN KEY (lawyer_id) REFERENCES users(id),
    CONSTRAINT fk_partner FOREIGN KEY (partner_id) REFERENCES users(id),
    CONSTRAINT check_different_users CHECK (lawyer_id != partner_id)
);

CREATE INDEX idx_partner_relationships_lawyer ON partner_relationships(lawyer_id);
CREATE INDEX idx_partner_relationships_partner ON partner_relationships(partner_id);
CREATE INDEX idx_partner_relationships_status ON partner_relationships(status);

-- Diaries (matters)
CREATE TABLE diaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lawyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    matter_date DATE NOT NULL,
    court_name VARCHAR(255) NOT NULL,
    case_type VARCHAR(100) NOT NULL,
    case_number VARCHAR(100),
    parties TEXT NOT NULL,
    purpose TEXT NOT NULL,
    notes TEXT,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_diary_lawyer FOREIGN KEY (lawyer_id) REFERENCES users(id)
);

CREATE INDEX idx_diaries_lawyer ON diaries(lawyer_id);
CREATE INDEX idx_diaries_matter_date ON diaries(matter_date);
CREATE INDEX idx_diaries_court ON diaries(court_name);

-- Diary edit permissions
CREATE TABLE diary_edit_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    diary_id UUID NOT NULL REFERENCES diaries(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    can_edit BOOLEAN DEFAULT true,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    granted_by UUID NOT NULL REFERENCES users(id),
    revoked_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(diary_id, partner_id),
    CONSTRAINT fk_permission_diary FOREIGN KEY (diary_id) REFERENCES diaries(id),
    CONSTRAINT fk_permission_partner FOREIGN KEY (partner_id) REFERENCES users(id),
    CONSTRAINT fk_permission_granter FOREIGN KEY (granted_by) REFERENCES users(id)
);

CREATE INDEX idx_diary_permissions_diary ON diary_edit_permissions(diary_id);
CREATE INDEX idx_diary_permissions_partner ON diary_edit_permissions(partner_id);

-- Requests
CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(30) NOT NULL CHECK (type IN ('partner_request', 'edit_request')),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    diary_id UUID REFERENCES diaries(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_request_sender FOREIGN KEY (sender_id) REFERENCES users(id),
    CONSTRAINT fk_request_receiver FOREIGN KEY (receiver_id) REFERENCES users(id),
    CONSTRAINT fk_request_diary FOREIGN KEY (diary_id) REFERENCES diaries(id),
    CONSTRAINT check_edit_request_has_diary CHECK (
        (type = 'edit_request' AND diary_id IS NOT NULL) OR 
        (type = 'partner_request' AND diary_id IS NULL)
    )
);

CREATE INDEX idx_requests_sender ON requests(sender_id);
CREATE INDEX idx_requests_receiver ON requests(receiver_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_type ON requests(type);

-- Audit logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_type VARCHAR(50) NOT NULL,
    performed_by UUID NOT NULL REFERENCES users(id),
    target_entity VARCHAR(50) NOT NULL,
    target_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (performed_by) REFERENCES users(id)
);

CREATE INDEX idx_audit_logs_performed_by ON audit_logs(performed_by);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_target ON audit_logs(target_entity, target_id);

-- Security functions

-- Function to encrypt enrollment number
CREATE OR REPLACE FUNCTION encrypt_enrollment_number(enrollment_text TEXT, secret_key TEXT)
RETURNS BYTEA AS $$
BEGIN
    RETURN pgp_sym_encrypt(enrollment_text, secret_key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt enrollment number (restricted)
CREATE OR REPLACE FUNCTION decrypt_enrollment_number(encrypted_data BYTEA, secret_key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(encrypted_data, secret_key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lawyer_profiles_updated_at BEFORE UPDATE ON lawyer_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_profiles_updated_at BEFORE UPDATE ON partner_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_relationships_updated_at BEFORE UPDATE ON partner_relationships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diaries_updated_at BEFORE UPDATE ON diaries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (action_type, performed_by, target_entity, target_id, old_values)
        VALUES (TG_OP, COALESCE(current_setting('app.current_user_id', true)::UUID, '00000000-0000-0000-0000-000000000000'), TG_TABLE_NAME, OLD.id, row_to_json(OLD));
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (action_type, performed_by, target_entity, target_id, old_values, new_values)
        VALUES (TG_OP, COALESCE(current_setting('app.current_user_id', true)::UUID, '00000000-0000-0000-0000-000000000000'), TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (action_type, performed_by, target_entity, target_id, new_values)
        VALUES (TG_OP, COALESCE(current_setting('app.current_user_id', true)::UUID, '00000000-0000-0000-0000-000000000000'), TG_TABLE_NAME, NEW.id, row_to_json(NEW));
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_diaries AFTER INSERT OR UPDATE OR DELETE ON diaries
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_diary_permissions AFTER INSERT OR UPDATE OR DELETE ON diary_edit_permissions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_partner_relationships AFTER INSERT OR UPDATE OR DELETE ON partner_relationships
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Row-level security policies

ALTER TABLE lawyer_profiles ENABLE ROW LEVEL SECURITY;

-- Only lawyers can see their own enrollment numbers
CREATE POLICY lawyer_profile_select_policy ON lawyer_profiles
    FOR SELECT
    USING (user_id = current_setting('app.current_user_id', true)::UUID);

-- Diaries access policy
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY diary_owner_policy ON diaries
    FOR ALL
    USING (lawyer_id = current_setting('app.current_user_id', true)::UUID);

CREATE POLICY diary_partner_read_policy ON diaries
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM diary_edit_permissions dep
            WHERE dep.diary_id = diaries.id
            AND dep.partner_id = current_setting('app.current_user_id', true)::UUID
            AND dep.can_edit = true
            AND dep.revoked_at IS NULL
        )
    );

-- Views for safe data access

-- Safe lawyer view (excludes enrollment number)
CREATE VIEW lawyers_public AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.phone,
    u.profile_photo,
    lp.bar_council,
    lp.practice_areas,
    lp.years_of_experience,
    lp.court_preferences,
    u.created_at
FROM users u
JOIN lawyer_profiles lp ON u.id = lp.user_id
WHERE u.role = 'lawyer';

-- Partner accessible diaries
CREATE VIEW partner_accessible_diaries AS
SELECT 
    d.*,
    dep.partner_id,
    dep.can_edit
FROM diaries d
JOIN diary_edit_permissions dep ON d.id = dep.diary_id
WHERE dep.revoked_at IS NULL;

-- Grant permissions
GRANT SELECT ON lawyers_public TO PUBLIC;
GRANT SELECT ON partner_accessible_diaries TO PUBLIC;
