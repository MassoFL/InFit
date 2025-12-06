# Publishing to App Store & Google Play

## Prerequisites

### Costs:
- **Apple App Store:** $99/year (Apple Developer Program)
- **Google Play Store:** $25 one-time fee

### Requirements:
- Mac computer (for iOS builds)
- Xcode installed (for iOS)
- Android Studio installed (for Android)

---

## Step 1: Install Capacitor

```bash
cd outfit-share
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
```

## Step 2: Initialize Capacitor

```bash
npx cap init
```

When prompted:
- App name: `InFit`
- App ID: `com.yourcompany.infit` (use your own domain reversed)
- Web directory: `out`

## Step 3: Update Next.js for Static Export

Update `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  output: 'export', // Add this line
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};
```

## Step 4: Build Your App

```bash
npm run build
```

## Step 5: Add Native Platforms

```bash
npx cap add ios
npx cap add android
```

## Step 6: Sync Your Web App

```bash
npx cap sync
```

---

## iOS - App Store Submission

### 1. Open in Xcode
```bash
npx cap open ios
```

### 2. Configure App in Xcode
- Set your Team (Apple Developer account)
- Update Bundle Identifier
- Set app version and build number
- Add app icons (in Assets.xcassets)
- Configure signing certificates

### 3. Build for Release
- Product → Archive
- Distribute App → App Store Connect
- Upload to App Store

### 4. App Store Connect
- Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
- Create new app
- Fill in metadata (description, screenshots, etc.)
- Submit for review

**Review time:** Usually 1-3 days

---

## Android - Google Play Submission

### 1. Open in Android Studio
```bash
npx cap open android
```

### 2. Configure App
- Update `android/app/build.gradle`:
  - Set `applicationId`
  - Set `versionCode` and `versionName`
- Add app icon in `res/mipmap` folders

### 3. Generate Signing Key
```bash
keytool -genkey -v -keystore infit-release-key.keystore -alias infit -keyalg RSA -keysize 2048 -validity 10000
```

### 4. Configure Signing
Create `android/key.properties`:
```
storePassword=your_password
keyPassword=your_password
keyAlias=infit
storeFile=../infit-release-key.keystore
```

Update `android/app/build.gradle` to use signing config.

### 5. Build Release APK/AAB
```bash
cd android
./gradlew bundleRelease
```

The AAB file will be in: `android/app/build/outputs/bundle/release/`

### 6. Google Play Console
- Go to [play.google.com/console](https://play.google.com/console)
- Create new app
- Upload AAB file
- Fill in store listing (description, screenshots, etc.)
- Submit for review

**Review time:** Usually a few hours to 1 day

---

## Required Assets

### App Icons
- **iOS:** 1024x1024 PNG (no transparency)
- **Android:** Various sizes (use Android Asset Studio)

### Screenshots
- **iOS:** 
  - 6.7" (iPhone 14 Pro Max): 1290x2796
  - 6.5" (iPhone 11 Pro Max): 1242x2688
  - 5.5" (iPhone 8 Plus): 1242x2208
- **Android:**
  - Phone: 1080x1920 minimum
  - Tablet: 1920x1080 minimum

### App Store Listing
- App name
- Subtitle (iOS only)
- Description
- Keywords
- Privacy policy URL
- Support URL
- Category
- Age rating

---

## Automated Build Option: EAS (Expo Application Services)

If you want to avoid setting up Xcode/Android Studio:

```bash
npm install -g eas-cli
eas build --platform ios
eas build --platform android
```

This builds in the cloud (requires Expo account, paid plans available).

---

## Quick Start Commands

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android

# Initialize
npx cap init

# Add platforms
npx cap add ios
npx cap add android

# Build and sync
npm run build
npx cap sync

# Open in native IDEs
npx cap open ios
npx cap open android
```

---

## Tips

1. **Start with Android** - It's easier and faster to publish
2. **Test on real devices** before submitting
3. **Prepare screenshots** in advance (use simulators/emulators)
4. **Write a good privacy policy** (required by both stores)
5. **App Store review is stricter** - make sure your app is polished
6. **Use TestFlight (iOS)** and Internal Testing (Android) for beta testing

---

## Maintenance

After publishing, to update your app:

```bash
# Make changes to your code
npm run build
npx cap sync

# Increment version numbers
# iOS: In Xcode
# Android: In android/app/build.gradle

# Rebuild and resubmit
```

---

## Need Help?

- Capacitor Docs: https://capacitorjs.com
- Apple Developer: https://developer.apple.com
- Google Play Console: https://play.google.com/console
