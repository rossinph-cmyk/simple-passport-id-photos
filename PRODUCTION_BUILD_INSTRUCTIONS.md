# Production Build Instructions

## Building Production APK

### Prerequisites
- Ensure you have an Expo account
- Make sure all app configurations in `app.json` are correct

### Step 1: Build with EAS

```bash
# Login to EAS (if not already logged in)
eas login

# Build for Android production
eas build --platform android --profile production
```

### Step 2: Download and Test

Once the build completes:
1. Download the APK from the EAS build page
2. Install on a real Android device (not emulator)
3. Test all app functionality:
   - Camera capture
   - Image cropping
   - Photo preview
   - Photo saving

## Platform Compatibility
- **Android**: Fully supported ✅
- **iOS**: Not configured
- **Web**: Preview available via Expo

## Troubleshooting

### If build fails:
1. Make sure app.json is valid JSON (no syntax errors)
2. Run `npx expo install --check` to verify dependencies
3. Clear cache: `npx expo start -c`
4. Try building again

### Common Issues:
- Ensure all required permissions are properly configured in app.json
- Verify SDK versions match across all dependencies
- Check that all required native modules are compatible with your Expo SDK version
