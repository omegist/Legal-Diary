# Easiest Way to View Your Database - pgAdmin

## Step 1: Download pgAdmin
Go to: https://www.pgadmin.org/download/pgadmin-4-windows/
Click "Download" and install it.

## Step 2: Open pgAdmin
After installation, open pgAdmin from your Start menu.

## Step 3: Add Your Database
1. Right-click on "Servers" in the left panel
2. Click "Register" → "Server"
3. In the "General" tab:
   - Name: Legal Diary
4. In the "Connection" tab:
   - Host: localhost
   - Port: 5432
   - Database: legal_diary
   - Username: postgres (or your PostgreSQL username)
   - Password: (your PostgreSQL password)
5. Click "Save"

## Step 4: View Your Data
1. In left panel, expand: Servers → Legal Diary → Databases → legal_diary → Schemas → public → Tables
2. Right-click on any table (like "users" or "diaries")
3. Click "View/Edit Data" → "All Rows"
4. You'll see all the data in a spreadsheet-like view!

## Tables You'll See:
- **users** - All users (lawyers and partners)
- **diaries** - All diary entries
- **lawyer_profiles** - Lawyer details
- **partner_profiles** - Partner details
- **requests** - All requests
- **partner_relationships** - Lawyer-partner connections
- **diary_edit_permissions** - Who can edit which diary
- **audit_logs** - All changes made

## That's It!
Now you can click any table and see all the data your users have entered.

## Quick Tips:
- Use the search box at top to filter data
- Click column headers to sort
- Right-click rows to edit/delete
- Use the "Query Tool" button to run custom SQL queries
