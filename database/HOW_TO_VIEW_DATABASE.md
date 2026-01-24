# How to View Your PostgreSQL Database

## Method 1: Command Line (psql)

### Connect to Database
```bash
psql -U your_username -d legal_diary
```

### Basic Commands
```sql
-- List all tables
\dt

-- Describe a table structure
\d users
\d diaries

-- View all users
SELECT * FROM users;

-- View all diaries
SELECT * FROM diaries;

-- Exit psql
\q
```

### Run Query File
```bash
psql -U your_username -d legal_diary -f database/queries.sql
```

## Method 2: pgAdmin (GUI Tool)

### Install pgAdmin
Download from: https://www.pgadmin.org/download/

### Steps:
1. Open pgAdmin
2. Right-click "Servers" → "Register" → "Server"
3. Enter connection details:
   - Name: Legal Diary
   - Host: localhost
   - Port: 5432
   - Database: legal_diary
   - Username: your_username
   - Password: your_password
4. Navigate: Servers → Legal Diary → Databases → legal_diary → Schemas → public → Tables
5. Right-click any table → "View/Edit Data" → "All Rows"

## Method 3: DBeaver (Free Universal Tool)

### Install DBeaver
Download from: https://dbeaver.io/download/

### Steps:
1. Open DBeaver
2. Click "New Database Connection"
3. Select "PostgreSQL"
4. Enter connection details
5. Test connection
6. Browse tables in left panel
7. Double-click table to view data

## Method 4: VS Code Extension

### Install PostgreSQL Extension
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search "PostgreSQL" by Chris Kolkman
4. Install it
5. Click PostgreSQL icon in sidebar
6. Add connection
7. Browse and query database

## Method 5: TablePlus (Premium but has free tier)

Download from: https://tableplus.com/

## Quick View Commands

### View Recent Users
```bash
psql -U your_username -d legal_diary -c "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 10;"
```

### View Recent Diaries
```bash
psql -U your_username -d legal_diary -c "SELECT d.id, u.name as lawyer, d.matter_date, d.court_name, d.case_type FROM diaries d JOIN users u ON d.lawyer_id = u.id ORDER BY d.created_at DESC LIMIT 10;"
```

### Count All Records
```bash
psql -U your_username -d legal_diary -c "SELECT 'Users' as table_name, COUNT(*) FROM users UNION ALL SELECT 'Diaries', COUNT(*) FROM diaries UNION ALL SELECT 'Requests', COUNT(*) FROM requests;"
```

## Export Data to CSV

```bash
# Export users
psql -U your_username -d legal_diary -c "COPY (SELECT * FROM users) TO STDOUT WITH CSV HEADER" > users.csv

# Export diaries
psql -U your_username -d legal_diary -c "COPY (SELECT * FROM diaries) TO STDOUT WITH CSV HEADER" > diaries.csv
```

## Backup Database

```bash
# Full backup
pg_dump -U your_username legal_diary > backup_$(date +%Y%m%d).sql

# Restore backup
psql -U your_username -d legal_diary < backup_20260124.sql
```

## Common Queries for Developers

### Check if database exists
```bash
psql -U your_username -l | grep legal_diary
```

### Check table sizes
```sql
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### View active connections
```sql
SELECT * FROM pg_stat_activity WHERE datname = 'legal_diary';
```

## Recommended: Use pgAdmin for Development

It provides:
- Visual table browser
- Query editor with syntax highlighting
- Data grid for viewing/editing
- ER diagrams
- Query history
- Export/Import tools

## Security Note

Never expose database credentials in your code. Always use environment variables:
```bash
export PGUSER=your_username
export PGPASSWORD=your_password
export PGDATABASE=legal_diary
export PGHOST=localhost
export PGPORT=5432
```

Then connect simply with:
```bash
psql
```
