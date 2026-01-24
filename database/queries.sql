-- Legal Diary Database Queries
-- Use these queries to view and manage your data

-- ============================================
-- VIEW ALL USERS
-- ============================================
SELECT 
    id,
    role,
    name,
    email,
    phone,
    created_at
FROM users
ORDER BY created_at DESC;

-- ============================================
-- VIEW ALL LAWYERS WITH PROFILES
-- ============================================
SELECT 
    u.id,
    u.name,
    u.email,
    u.phone,
    lp.bar_council,
    lp.practice_areas,
    lp.years_of_experience,
    lp.court_preferences,
    u.created_at
FROM users u
JOIN lawyer_profiles lp ON u.id = lp.user_id
WHERE u.role = 'lawyer'
ORDER BY u.created_at DESC;

-- ============================================
-- VIEW ALL PARTNERS WITH PROFILES
-- ============================================
SELECT 
    u.id,
    u.name,
    u.email,
    u.phone,
    pp.organization,
    pp.designation,
    u.created_at
FROM users u
JOIN partner_profiles pp ON u.id = pp.user_id
WHERE u.role = 'partner'
ORDER BY u.created_at DESC;

-- ============================================
-- VIEW ALL DIARIES (MATTERS)
-- ============================================
SELECT 
    d.id,
    u.name as lawyer_name,
    d.matter_date,
    d.court_name,
    d.case_type,
    d.case_number,
    d.parties,
    d.purpose,
    d.is_private,
    d.created_at
FROM diaries d
JOIN users u ON d.lawyer_id = u.id
ORDER BY d.matter_date DESC;

-- ============================================
-- VIEW DIARIES WITH LAWYER DETAILS
-- ============================================
SELECT 
    d.id as diary_id,
    d.matter_date,
    d.court_name,
    d.case_type,
    d.case_number,
    d.parties,
    d.purpose,
    d.notes,
    u.name as lawyer_name,
    u.email as lawyer_email,
    d.created_at
FROM diaries d
JOIN users u ON d.lawyer_id = u.id
ORDER BY d.matter_date DESC;

-- ============================================
-- VIEW PARTNER RELATIONSHIPS
-- ============================================
SELECT 
    pr.id,
    l.name as lawyer_name,
    l.email as lawyer_email,
    p.name as partner_name,
    p.email as partner_email,
    pr.status,
    pr.created_at
FROM partner_relationships pr
JOIN users l ON pr.lawyer_id = l.id
JOIN users p ON pr.partner_id = p.id
ORDER BY pr.created_at DESC;

-- ============================================
-- VIEW DIARY EDIT PERMISSIONS
-- ============================================
SELECT 
    dep.id,
    d.case_number,
    d.parties,
    l.name as diary_owner,
    p.name as partner_name,
    dep.can_edit,
    dep.granted_at,
    dep.revoked_at,
    g.name as granted_by
FROM diary_edit_permissions dep
JOIN diaries d ON dep.diary_id = d.id
JOIN users l ON d.lawyer_id = l.id
JOIN users p ON dep.partner_id = p.id
JOIN users g ON dep.granted_by = g.id
ORDER BY dep.granted_at DESC;

-- ============================================
-- VIEW ALL REQUESTS
-- ============================================
SELECT 
    r.id,
    r.type,
    s.name as sender_name,
    s.email as sender_email,
    rec.name as receiver_name,
    rec.email as receiver_email,
    r.status,
    r.message,
    r.created_at
FROM requests r
JOIN users s ON r.sender_id = s.id
JOIN users rec ON r.receiver_id = rec.id
ORDER BY r.created_at DESC;

-- ============================================
-- VIEW PENDING REQUESTS
-- ============================================
SELECT 
    r.id,
    r.type,
    s.name as sender,
    rec.name as receiver,
    r.status,
    r.created_at
FROM requests r
JOIN users s ON r.sender_id = s.id
JOIN users rec ON r.receiver_id = rec.id
WHERE r.status = 'pending'
ORDER BY r.created_at DESC;

-- ============================================
-- VIEW AUDIT LOGS
-- ============================================
SELECT 
    al.id,
    al.action_type,
    u.name as performed_by,
    al.target_entity,
    al.target_id,
    al.timestamp
FROM audit_logs al
JOIN users u ON al.performed_by = u.id
ORDER BY al.timestamp DESC
LIMIT 100;

-- ============================================
-- COUNT STATISTICS
-- ============================================
SELECT 
    'Total Users' as metric,
    COUNT(*) as count
FROM users
UNION ALL
SELECT 
    'Total Lawyers',
    COUNT(*)
FROM users WHERE role = 'lawyer'
UNION ALL
SELECT 
    'Total Partners',
    COUNT(*)
FROM users WHERE role = 'partner'
UNION ALL
SELECT 
    'Total Diaries',
    COUNT(*)
FROM diaries
UNION ALL
SELECT 
    'Total Relationships',
    COUNT(*)
FROM partner_relationships
UNION ALL
SELECT 
    'Pending Requests',
    COUNT(*)
FROM requests WHERE status = 'pending';

-- ============================================
-- SEARCH USER BY EMAIL
-- ============================================
-- Replace 'user@example.com' with actual email
SELECT 
    u.*,
    CASE 
        WHEN u.role = 'lawyer' THEN 'Lawyer Profile Exists'
        WHEN u.role = 'partner' THEN 'Partner Profile Exists'
    END as profile_status
FROM users u
WHERE u.email = 'user@example.com';

-- ============================================
-- VIEW SPECIFIC LAWYER'S DIARIES
-- ============================================
-- Replace 'lawyer-uuid' with actual lawyer ID
SELECT 
    d.*
FROM diaries d
WHERE d.lawyer_id = 'lawyer-uuid'
ORDER BY d.matter_date DESC;

-- ============================================
-- VIEW DIARIES ACCESSIBLE TO A PARTNER
-- ============================================
-- Replace 'partner-uuid' with actual partner ID
SELECT 
    d.*,
    u.name as lawyer_name,
    dep.can_edit
FROM diaries d
JOIN diary_edit_permissions dep ON d.id = dep.diary_id
JOIN users u ON d.lawyer_id = u.id
WHERE dep.partner_id = 'partner-uuid'
AND dep.revoked_at IS NULL
ORDER BY d.matter_date DESC;
