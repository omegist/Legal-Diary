# Complete Setup Instructions

## Step 1: Load New Database Schema

1. Open pgAdmin 4
2. Right-click on `legal_diary` database → Query Tool
3. Open file: `D:\Legal Diary\database\schema_simple.sql`
4. Click Execute (▶️)
5. This will recreate tables to match your app

## Step 2: Configure Backend

Edit `server/.env` and set your PostgreSQL password:
```
DB_PASSWORD=your_actual_postgres_password
```

## Step 3: Install Backend Dependencies

```bash
cd server
npm install
```

## Step 4: Start Backend Server

```bash
npm run dev
```

You should see:
```
✅ Backend server running on http://localhost:3001
📊 Database: legal_diary
```

## Step 5: Start Frontend

In a NEW terminal:
```bash
cd "D:\Legal Diary"
npm run dev
```

## Step 6: Test It!

1. Open http://localhost:8080
2. Create a new lawyer account
3. Create a diary entry
4. Open pgAdmin → legal_diary → Tables → users → View/Edit Data
5. You should see your user!
6. Check diaries table to see your diary entry

## ✅ Success!

Your app now saves ALL data to PostgreSQL!
View everything in pgAdmin anytime.

## Troubleshooting

**Backend won't start:**
- Check PostgreSQL is running
- Verify password in server/.env
- Make sure port 3001 is free

**Frontend shows errors:**
- Make sure backend is running first
- Check browser console for errors
- Verify backend URL is http://localhost:3001

**No data in pgAdmin:**
- Make sure you ran schema_simple.sql
- Check backend terminal for errors
- Try creating a new user/diary
