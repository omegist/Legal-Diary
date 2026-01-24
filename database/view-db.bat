@echo off
REM Quick Database Access Script for Windows

echo ========================================
echo Legal Diary Database Access
echo ========================================
echo.

:menu
echo Choose an option:
echo 1. View all users
echo 2. View all diaries
echo 3. View all requests
echo 4. View statistics
echo 5. Open psql interactive shell
echo 6. Exit
echo.

set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto users
if "%choice%"=="2" goto diaries
if "%choice%"=="3" goto requests
if "%choice%"=="4" goto stats
if "%choice%"=="5" goto shell
if "%choice%"=="6" goto end

:users
echo.
echo Fetching users...
psql -U postgres -d legal_diary -c "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC;"
echo.
pause
goto menu

:diaries
echo.
echo Fetching diaries...
psql -U postgres -d legal_diary -c "SELECT d.id, u.name as lawyer, d.matter_date, d.court_name, d.case_type, d.parties FROM diaries d JOIN users u ON d.lawyer_id = u.id ORDER BY d.matter_date DESC LIMIT 20;"
echo.
pause
goto menu

:requests
echo.
echo Fetching requests...
psql -U postgres -d legal_diary -c "SELECT r.type, s.name as sender, rec.name as receiver, r.status, r.created_at FROM requests r JOIN users s ON r.sender_id = s.id JOIN users rec ON r.receiver_id = rec.id ORDER BY r.created_at DESC LIMIT 20;"
echo.
pause
goto menu

:stats
echo.
echo Database Statistics...
psql -U postgres -d legal_diary -c "SELECT 'Total Users' as metric, COUNT(*) as count FROM users UNION ALL SELECT 'Total Lawyers', COUNT(*) FROM users WHERE role = 'lawyer' UNION ALL SELECT 'Total Partners', COUNT(*) FROM users WHERE role = 'partner' UNION ALL SELECT 'Total Diaries', COUNT(*) FROM diaries UNION ALL SELECT 'Total Requests', COUNT(*) FROM requests;"
echo.
pause
goto menu

:shell
echo.
echo Opening PostgreSQL shell...
psql -U postgres -d legal_diary
goto menu

:end
echo.
echo Goodbye!
exit
