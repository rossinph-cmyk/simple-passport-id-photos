# Simple Passport ID & Photos

Create professional passport ID photos in seconds with AI-powered framing and automatic background removal.

## Recent Updates

### Background Theme Feature (Latest)
- **Patriotic themed backgrounds with authentic flag designs**
  - American theme: Red and white stripes with blue canton and stars (25% opacity)
  - Indian theme: Saffron, white, and green horizontal bands with Ashoka Chakra (25% opacity)
- **Dynamic theme colors with official flag colors**
  - American theme uses official US flag colors: Sharp Red (#BF0A30) and True Blue (#002868)
  - Indian theme uses official Indian flag colors: Saffron (#FF9933) and Green (#138808)
  - All buttons use theme-specific gradient colors
  - Title, icons, and UI elements change to match selected theme
- **Dynamic flag icon in header**
  - Flag icon in top-left corner changes based on selected theme
  - American theme displays US flag (blue, white, red horizontal stripes)
  - Indian theme displays Indian flag (saffron, white, green horizontal stripes)
- Added prominent instruction banner with visual guidance
- Theme selection persists using AsyncStorage
- Easy-to-use theme switcher with flag emojis
- Fixed infinite loop issue with useMemo for theme colors

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
