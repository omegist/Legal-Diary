# Legal Diary Mobile App Guide

## Changes Made for Mobile

### 1. Network Configuration
- ✅ Added `cleartext traffic` support in AndroidManifest.xml
- ✅ Configured Capacitor to use HTTPS scheme
- ✅ API URL set to production: `https://legal-diary-backend.onrender.com/api`

### 2. Mobile-Responsive UI
- ✅ Reduced header height on mobile (14px on mobile, 16px on desktop)
- ✅ Smaller icons and buttons on mobile
- ✅ Better spacing and padding for touch targets
- ✅ Improved viewport configuration
- ✅ Mobile-first padding on all pages

### 3. Fixed Issues
- ✅ Header icons no longer overlap
- ✅ Network requests work on mobile
- ✅ Forms are properly sized for mobile screens

## How to Rebuild APK

After making changes to the code:

```bash
# 1. Build the React app
npm run build

# 2. Sync with Capacitor
npx cap sync

# 3. Open in Android Studio
npx cap open android

# 4. In Android Studio:
#    - Wait for Gradle sync
#    - Build > Build Bundle(s) / APK(s) > Build APK(s)
#    - Find APK at: android/app/build/outputs/apk/debug/app-debug.apk
```

## Testing the APK

1. Transfer `app-debug.apk` to your Android phone
2. Install and test all features:
   - Login/Signup
   - Create Diary
   - View Diaries
   - Edit Diary
   - Requests
   - Partners
   - Profile

## Common Issues & Solutions

### Issue: "Failed to create diary"
**Solution**: Make sure you're connected to the internet. The app needs to connect to the backend server.

### Issue: Layout looks wrong
**Solution**: Clear app data and reinstall:
- Settings > Apps > Legal Diary > Storage > Clear Data
- Uninstall and reinstall the APK

### Issue: Can't connect to server
**Solution**: Check if backend is running:
- Visit: https://legal-diary-backend.onrender.com/api/users
- Should return JSON data
- If not, backend may be sleeping (Render free tier)

## Creating Release APK for Play Store

### Step 1: Generate Keystore (One-time)
```bash
cd "d:\Legal Diary\android\app"
keytool -genkey -v -keystore legal-diary.keystore -alias legal-diary -keyalg RSA -keysize 2048 -validity 10000
```

Enter details:
- Password: [Choose a strong password - SAVE IT!]
- Name: Your name
- Organization: Your company
- City, State, Country: Your location

### Step 2: Build Signed APK
1. Open Android Studio
2. Build > Generate Signed Bundle / APK
3. Select APK > Next
4. Key store path: Browse to `legal-diary.keystore`
5. Enter password and alias
6. Select "release" build variant
7. Click Finish

### Step 3: Find Release APK
Location: `android/app/build/outputs/apk/release/app-release.apk`

### Step 4: Upload to Play Store
1. Go to Google Play Console
2. Create new app
3. Upload `app-release.apk`
4. Fill in app details, screenshots, description
5. Submit for review

## App Updates

### For Debug APK (Testing)
- Make changes in code
- Run `npm run build && npx cap sync`
- Rebuild APK in Android Studio
- Install new APK on phone

### For Production (Play Store)
- Make changes in code
- Increase version number in `android/app/build.gradle`:
  ```gradle
  versionCode 2  // Increment this
  versionName "1.1"  // Update version
  ```
- Build signed release APK
- Upload to Play Store
- Users get update notification

## Important Notes

1. **Backend URL**: Currently using `https://legal-diary-backend.onrender.com/api`
   - Render free tier may sleep after 15 minutes of inactivity
   - First request after sleep takes 30-60 seconds

2. **Database**: Using Aiven PostgreSQL cloud database
   - All data is stored in the cloud
   - Accessible from web and mobile app

3. **Authentication**: Uses localStorage for session
   - Users stay logged in until they logout
   - Clearing app data will log them out

4. **Offline Mode**: Currently NOT supported
   - App requires internet connection
   - Future: Can add offline support with local database

## Future Enhancements

- [ ] Add offline mode with local SQLite database
- [ ] Add push notifications for reminders
- [ ] Add biometric authentication (fingerprint/face)
- [ ] Add dark mode toggle
- [ ] Add file attachments for diary entries
- [ ] Add export to PDF feature
- [ ] Add search and filter functionality
- [ ] Add analytics dashboard

## Support

If you encounter any issues:
1. Check internet connection
2. Check if backend is running
3. Clear app data and reinstall
4. Check Android version (minimum: Android 5.0)
