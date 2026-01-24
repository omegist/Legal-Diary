# Legal Diary Database Setup

## Prerequisites
- PostgreSQL 14 or higher
- pgcrypto extension
- uuid-ossp extension

## Setup Instructions

### 1. Create Database
```bash
createdb legal_diary
```

### 2. Run Schema
```bash
psql -d legal_diary -f database/schema.sql
```

### 3. Set Encryption Key
Store your encryption key securely (use environment variable):
```bash
export ENROLLMENT_ENCRYPTION_KEY="your-secure-key-here"
```

## Security Features

### 1. Encrypted Enrollment Numbers
```sql
-- Insert lawyer with encrypted enrollment
INSERT INTO lawyer_profiles (user_id, enrollment_number, bar_council)
VALUES (
    'user-uuid',
    encrypt_enrollment_number('BAR/12345/2020', 'your-secret-key'),
    'State Bar Council'
);

-- Decrypt (only for authorized operations)
SELECT decrypt_enrollment_number(enrollment_number, 'your-secret-key')
FROM lawyer_profiles
WHERE user_id = 'user-uuid';
```

### 2. Row-Level Security
Set current user context before queries:
```sql
SET app.current_user_id = 'user-uuid';
```

### 3. Audit Logging
All changes to diaries, permissions, and relationships are automatically logged.

## Key Constraints

1. **Partner Relationships**: Unique per lawyer-partner pair
2. **Edit Permissions**: Only diary owners can grant
3. **Requests**: Edit requests must have diary_id
4. **Enrollment Numbers**: Never exposed in public views

## Database Indexes

Optimized for:
- User role lookups
- Diary date range queries
- Permission checks
- Audit log searches

## Backup Strategy

```bash
# Daily backup
pg_dump legal_diary > backup_$(date +%Y%m%d).sql

# Encrypted backup
pg_dump legal_diary | gpg --encrypt > backup_$(date +%Y%m%d).sql.gpg
```

## Connection String Format

```
postgresql://username:password@localhost:5432/legal_diary?sslmode=require
```
