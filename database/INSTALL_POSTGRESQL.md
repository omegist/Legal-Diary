# Install PostgreSQL First

## You need to install PostgreSQL before you can use the database.

### Step 1: Download PostgreSQL
Go to: https://www.postgresql.org/download/windows/
Click "Download the installer"

### Step 2: Install PostgreSQL
1. Run the downloaded installer
2. Click "Next" through the setup
3. **IMPORTANT**: When asked for a password, set one and REMEMBER IT (e.g., "admin123")
4. Keep default port: 5432
5. Click "Next" until installation completes

### Step 3: Verify Installation
Open Command Prompt and type:
```
psql --version
```
You should see: `psql (PostgreSQL) 16.x`

### Step 4: Create Database
Open Command Prompt and run:
```
psql -U postgres
```
Enter your password when prompted.

Then type:
```sql
CREATE DATABASE legal_diary;
\q
```

### Step 5: Run Schema
```
cd "D:\Legal Diary"
psql -U postgres -d legal_diary -f database\schema.sql
```
Enter your password when prompted.

### Step 6: Now Connect with pgAdmin
1. Open pgAdmin
2. It should auto-detect your PostgreSQL server
3. If not, add server with:
   - Host: localhost
   - Port: 5432
   - Username: postgres
   - Password: (the password you set during installation)
   - Database: legal_diary

## That's it! Now you can view your database.
