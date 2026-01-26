# Backend Setup Guide

## Step 1: Install Dependencies
```bash
cd server
npm install
```

## Step 2: Configure Database
Edit `server/.env` and set your PostgreSQL password:
```
DB_PASSWORD=your_actual_postgres_password
```

## Step 3: Start Backend Server
```bash
npm run dev
```

Server will run on http://localhost:3001

## Step 4: Test Backend
Open browser: http://localhost:3001/api/health
Should see: {"status":"ok"}

## Step 5: Start Frontend
In another terminal:
```bash
cd "D:\Legal Diary"
npm run dev
```

## Now Your App Uses PostgreSQL!

When you create users/diaries, data will be saved to PostgreSQL.
View data in pgAdmin: legal_diary → Tables → users (right-click → View/Edit Data)

## Troubleshooting

If backend won't start:
1. Check PostgreSQL is running
2. Verify password in server/.env
3. Check port 3001 is not in use

If frontend can't connect:
1. Make sure backend is running on port 3001
2. Check browser console for errors
