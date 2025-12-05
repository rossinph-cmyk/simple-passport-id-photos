# Simple Passport ID & Photos

Create professional passport ID photos in seconds with AI-powered framing and automatic background removal.

## Recent Updates

### Background Theme Feature (Latest)
- **Full-screen translucent themed backgrounds**
  - American theme: Full American flag pattern (red/white stripes with blue canton and stars) at 15% opacity covering the entire app background
  - Indian theme: Full Indian flag pattern (saffron/white/green stripes with Ashoka Chakra) at 15% opacity covering the entire app background
  - Semi-transparent white panels (95% opacity) overlay the themed background for content sections
  - Creates an immersive patriotic atmosphere throughout the app
- **Dynamic theme colors with pure, vibrant flag colors**
  - American theme uses pure colors: Crimson Red (#DC143C) and Pure Blue (#0000FF)
  - Indian theme uses official Indian flag colors: Saffron (#FF9933) and Green (#138808)
  - All buttons use theme-specific gradient colors
  - Title, icons, and UI elements change to match selected theme
- **Authentic flag icons in header**
  - American theme displays a proper mini American flag with:
    - Red and white horizontal stripes
    - Blue canton with white stars
  - Indian theme displays an authentic Indian flag with:
    - Saffron, white, and green horizontal stripes
    - Blue Ashoka Chakra (wheel with 8 spokes) in the center of the white stripe
  - Flag icon changes dynamically based on selected theme
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
