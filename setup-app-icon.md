# Setup App Icon - Legal Diary

## Your logo location: `d:\Legal Diary\logo.png`

## Method 1: Using Android Studio (Easiest)

1. **Open Android Studio** (if not already open):
   ```bash
   npx cap open android
   ```

2. **Right-click on `res` folder**:
   - In Android Studio, find: `app > res` (in left sidebar)
   - Right-click on `res`
   - Select **New > Image Asset**

3. **Configure Icon**:
   - Asset Type: **Launcher Icons (Adaptive and Legacy)**
   - Name: `ic_launcher`
   - Foreground Layer:
     - Source Asset: **Image**
     - Path: Click folder icon → Browse to `d:\Legal Diary\logo.png`
   - Background Layer: Choose a color (white or your brand color)
   - Click **Next** → **Finish**

4. **Rebuild APK**:
   - Build > Build Bundle(s) / APK(s) > Build APK(s)

## Method 2: Using Online Tool (Alternative)

1. **Go to**: https://icon.kitchen/

2. **Upload your logo**:
   - Click "Upload Image"
   - Select `d:\Legal Diary\logo.png`

3. **Configure**:
   - Platform: **Android**
   - Icon Type: **Launcher Icons**
   - Adjust padding if needed

4. **Download**:
   - Click "Download"
   - Extract the ZIP file

5. **Copy icons to project**:
   - Copy all folders (mipmap-hdpi, mipmap-mdpi, etc.)
   - Paste into: `d:\Legal Diary\android\app\src\main\res\`
   - Replace existing files

6. **Rebuild APK**:
   ```bash
   npm run build
   npx cap sync
   npx cap open android
   ```
   - Build > Build Bundle(s) / APK(s) > Build APK(s)

## Method 3: Manual Copy (If you have pre-generated icons)

If you already have icons in different sizes, copy them to:

```
d:\Legal Diary\android\app\src\main\res\
├── mipmap-hdpi/
│   ├── ic_launcher.png (72x72)
│   └── ic_launcher_round.png (72x72)
├── mipmap-mdpi/
│   ├── ic_launcher.png (48x48)
│   └── ic_launcher_round.png (48x48)
├── mipmap-xhdpi/
│   ├── ic_launcher.png (96x96)
│   └── ic_launcher_round.png (96x96)
├── mipmap-xxhdpi/
│   ├── ic_launcher.png (144x144)
│   └── ic_launcher_round.png (144x144)
└── mipmap-xxxhdpi/
    ├── ic_launcher.png (192x192)
    └── ic_launcher_round.png (192x192)
```

## Verify Icon Changed

After rebuilding APK:
1. Install new APK on phone
2. Check home screen - you should see your logo
3. Check app drawer - your logo should appear

## Troubleshooting

**Icon not changing?**
- Clear app data: Settings > Apps > Legal Diary > Storage > Clear Data
- Uninstall old app completely
- Install new APK
- Restart phone if needed

**Icon looks blurry?**
- Make sure your logo.png is at least 512x512 pixels
- Use PNG format with transparent background for best results
