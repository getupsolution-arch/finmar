# FINMAR Mobile App - Build Guide

## Overview
FINMAR mobile app is built using **Capacitor** - a cross-platform native runtime that allows the React web app to run as a native iOS and Android application.

## Features
- ✅ User Dashboard & Subscription Management
- ✅ AI Business Assistant
- ✅ Push Notifications (iOS & Android)
- ✅ Offline Access with Data Caching
- ✅ Network Status Detection

## Prerequisites

### For iOS Development
- macOS computer
- Xcode 14+ (from Mac App Store)
- Apple Developer Account ($99/year) - for App Store submission
- CocoaPods: `sudo gem install cocoapods`

### For Android Development
- Android Studio (https://developer.android.com/studio)
- Java 17+ JDK
- Google Play Developer Account ($25 one-time) - for Play Store submission

## Project Structure
```
/app/frontend/
├── capacitor.config.json    # Capacitor configuration
├── src/mobile/
│   ├── index.js            # Mobile exports
│   ├── capacitor.js        # Native API utilities
│   ├── hooks.js            # React hooks for mobile features
│   └── MobileProvider.js   # Context provider for mobile state
├── ios/                    # iOS native project (generated)
└── android/                # Android native project (generated)
```

## Setup Instructions

### Step 1: Build the Web App
```bash
cd /app/frontend
yarn build
```

### Step 2: Add Native Platforms

#### Add iOS Platform
```bash
npx cap add ios
```

#### Add Android Platform
```bash
npx cap add android
```

### Step 3: Sync Web Assets to Native Projects
```bash
npx cap sync
```

### Step 4: Configure Push Notifications

#### For iOS (APNs)
1. In Xcode, enable "Push Notifications" capability
2. Create APNs key in Apple Developer Portal
3. Upload key to your push notification service (e.g., Firebase, OneSignal)

#### For Android (FCM)
1. Create Firebase project at https://console.firebase.google.com
2. Add Android app with package name: `com.finmar.app`
3. Download `google-services.json` and place in `android/app/`
4. Add Firebase to your backend for sending notifications

### Step 5: Open in IDE

#### Open iOS in Xcode
```bash
npx cap open ios
```

#### Open Android in Android Studio
```bash
npx cap open android
```

## Building for Release

### iOS Release Build
1. Open in Xcode: `npx cap open ios`
2. Select your Team in Signing & Capabilities
3. Product → Archive
4. Distribute App → App Store Connect

### Android Release Build
1. Open in Android Studio: `npx cap open android`
2. Build → Generate Signed Bundle/APK
3. Create keystore (first time only)
4. Upload to Google Play Console

## App Icons & Splash Screens

### Generate Assets
Use a tool like https://www.appicon.co/ to generate all required sizes from a 1024x1024 source image.

### iOS Icons
Place in: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

### Android Icons
Place in: `android/app/src/main/res/` (mipmap folders)

### Splash Screen
Configure in `capacitor.config.json`:
```json
{
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000,
      "backgroundColor": "#0f172a"
    }
  }
}
```

## Development Workflow

### Live Reload (Development)
```bash
# Build and sync
yarn build && npx cap sync

# For iOS with live reload
npx cap run ios --livereload --external

# For Android with live reload
npx cap run android --livereload --external
```

### Update After Code Changes
```bash
yarn build && npx cap sync
```

## Push Notification Server Integration

Add this endpoint to your backend to register device tokens:

```python
@api_router.post("/notifications/register")
async def register_push_token(
    token_data: dict,
    current_user: User = Depends(get_current_user)
):
    await db.push_tokens.update_one(
        {"user_id": current_user.user_id},
        {"$set": {
            "token": token_data["token"],
            "platform": token_data["platform"],
            "updated_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    return {"message": "Token registered"}
```

## Troubleshooting

### iOS Build Fails
- Run `pod install` in the `ios/App` directory
- Clean build: Xcode → Product → Clean Build Folder

### Android Build Fails
- Sync Gradle: File → Sync Project with Gradle Files
- Invalidate caches: File → Invalidate Caches / Restart

### Push Notifications Not Working
- iOS: Check APNs certificate/key is valid
- Android: Verify `google-services.json` is in correct location
- Both: Ensure notification permissions are granted

## App Store Checklist

### iOS App Store
- [ ] App icons (all sizes)
- [ ] Screenshots (6.5", 5.5" iPhones, iPad)
- [ ] App description and keywords
- [ ] Privacy policy URL
- [ ] Age rating
- [ ] APNs configured

### Google Play Store
- [ ] App icons and feature graphic
- [ ] Screenshots (phone and tablet)
- [ ] App description
- [ ] Privacy policy URL
- [ ] Content rating questionnaire
- [ ] FCM configured

## Environment Configuration

For production builds, update the API URL in your build:

```bash
# Create production .env
REACT_APP_BACKEND_URL=https://api.finmar.com.au
```

Then build:
```bash
yarn build && npx cap sync
```
