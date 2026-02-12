# FINMAR Mobile App Build Guide

## Overview
FINMAR mobile app is built using Capacitor 6, which wraps the existing React web application into native iOS and Android apps.

## Features
- ✅ User Dashboard & Subscription Management
- ✅ AI Business Assistant
- ✅ Push Notifications (iOS & Android)
- ✅ Offline Access with data caching
- ✅ Network status detection

## Prerequisites

### For iOS Development:
- macOS computer
- Xcode 15+ (from App Store)
- Apple Developer Account ($99/year for App Store distribution)
- CocoaPods (`sudo gem install cocoapods`)

### For Android Development:
- Android Studio (any platform)
- JDK 17+
- Google Play Developer Account ($25 one-time)

## Project Structure
```
frontend/
├── capacitor.config.json    # Capacitor configuration
├── ios/                     # iOS native project
│   └── App/
│       └── App/
│           └── AppDelegate.swift
├── android/                 # Android native project
│   └── app/
│       └── src/
│           └── main/
│               ├── AndroidManifest.xml
│               └── java/com/finmar/app/
├── src/
│   └── mobile/             # Mobile-specific code
│       ├── capacitor.js    # Native platform utilities
│       ├── hooks.js        # React hooks for mobile features
│       ├── MobileProvider.js # Context provider
│       └── index.js
```

## Development Workflow

### 1. Make Web Changes
```bash
cd /app/frontend
# Make your code changes
```

### 2. Build Web Assets
```bash
cd /app/frontend
DISABLE_ESLINT_PLUGIN=true yarn build
```

### 3. Sync to Native Projects
```bash
npx cap sync
```

### 4. Open in IDE
```bash
# For iOS
npx cap open ios

# For Android  
npx cap open android
```

## Push Notifications Setup

### Firebase Cloud Messaging (Android)
1. Create project at https://console.firebase.google.com
2. Add Android app with package name `com.finmar.app`
3. Download `google-services.json`
4. Place in `android/app/google-services.json`

### Apple Push Notification Service (iOS)
1. Go to Apple Developer Portal
2. Create App ID with Push Notifications capability
3. Create APNs Key or Certificate
4. Configure in Xcode project capabilities

## Building for Production

### iOS Build
```bash
cd ios
pod install
# Open in Xcode and Archive
# or use xcodebuild CLI
```

### Android Build
```bash
cd android
./gradlew assembleRelease
# APK will be in app/build/outputs/apk/release/
```

## App Store Submission

### iOS (App Store Connect)
1. Archive build in Xcode
2. Upload to App Store Connect
3. Complete app metadata
4. Submit for review

### Android (Google Play Console)
1. Create signed AAB/APK
2. Upload to Google Play Console
3. Complete store listing
4. Submit for review

## API Endpoints for Mobile

### Push Token Registration
```
POST /api/notifications/register
{
  "token": "firebase_or_apns_token",
  "platform": "ios" | "android"
}
```

### Unregister Token
```
DELETE /api/notifications/unregister?platform=ios
```

## Offline Support

The app caches:
- User profile data
- Subscription information
- AI chat history

When offline:
- Users see cached data
- Actions are queued for sync
- Offline indicator appears at top of screen

## Testing

### On Device
```bash
# iOS
npx cap run ios

# Android
npx cap run android
```

### Simulators
```bash
# iOS Simulator (macOS only)
npx cap run ios --target="iPhone 15 Pro"

# Android Emulator
npx cap run android --target="Pixel_7_API_34"
```

## Environment Configuration

Update `capacitor.config.json` for different environments:

```json
{
  "server": {
    "url": "https://your-production-url.com",
    "cleartext": false
  }
}
```

## Troubleshooting

### iOS Build Issues
```bash
cd ios
pod deintegrate
pod install
```

### Android Build Issues
```bash
cd android
./gradlew clean
./gradlew build
```

### Capacitor Sync Issues
```bash
npx cap sync --force
```

## Version Management

Update version in:
- `package.json` (version field)
- `ios/App/App/Info.plist` (CFBundleShortVersionString)
- `android/app/build.gradle` (versionName, versionCode)

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `yarn build` | Build web assets |
| `npx cap sync` | Sync web to native |
| `npx cap open ios` | Open Xcode |
| `npx cap open android` | Open Android Studio |
| `npx cap run ios` | Run on iOS device |
| `npx cap run android` | Run on Android device |
