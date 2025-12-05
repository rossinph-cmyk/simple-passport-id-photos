# Simple Passport ID & Photos

Create professional passport ID photos in seconds with AI-powered framing and automatic background removal.

## Recent Updates

### Background Theme Feature (Latest)
- Added background theme toggle with American and Indian themes
- Created themed backgrounds for the photo cropping screen
  - American theme: Red, white, and blue gradient with subtle star pattern
  - Indian theme: Saffron, white, and green gradient with chakra-inspired pattern
- Added prominent instruction banner: "Please take a selfie or upload a picture on a plain white background"
- Theme selection persists using AsyncStorage
- Easy-to-use theme switcher button on home screen

### Complete Rebranding
- Renamed app from "EZ Passport ID Photo Maker" to "Simple Passport ID & Photos"
- Updated all app identifiers and bundle IDs
- Changed package names and slugs
- Updated all user-facing text and titles
- Modified album names and permissions text
- No traces of old branding remain

### File System API Fix
- **Downgraded expo-file-system from v19.0.17 to v18.1.11** - Fixed C++ exception by using correct version for Expo SDK 53
- Using standard `expo-file-system` import (v18 doesn't have `/legacy` export)
- Removed unnecessary file copy operations in camera.tsx
- Simplified camera flow to use temporary URIs directly
- All file operations use stable API methods:
  - `FileSystem.downloadAsync()` for downloads
  - `FileSystem.readAsStringAsync()` with Base64 encoding for reading files
  - `FileSystem.cacheDirectory` for temporary files
- App is stable and bundling successfully
