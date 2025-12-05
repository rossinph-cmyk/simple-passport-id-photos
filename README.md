# Simple Passport ID & Photos

Create professional passport ID photos in seconds with AI-powered framing and automatic background removal.

## Recent Updates

### Multi-Language Theme System (Latest)
- **Six complete language themes with cultural authenticity**
  - 🇺🇸 American (English)
  - 🇮🇳 Indian (Hindi - Devanagari script)
  - 🇵🇭 Filipino (Tagalog)
  - 🇨🇳 Chinese (Simplified Chinese)
  - 🇪🇸 Spanish (Español)
  - 🇸🇦 Arabic (العربية - UAE Flag)
- **Full-screen translucent themed backgrounds**
  - Each theme displays its authentic national flag pattern at 35% opacity
  - American: Red/white stripes with blue canton and stars
  - Indian: Saffron/white/green stripes with Ashoka Chakra (24 spokes)
  - Filipino: Blue/red horizontal bands with white triangle
  - Chinese: Red background with yellow stars
  - Spanish: Red-yellow-red horizontal stripes
  - Arabic: UAE flag with vertical red stripe and horizontal green-white-black stripes
  - Semi-transparent white panels (92% opacity) overlay the themed background for content sections
- **Complete multi-language localization**
  - All UI text translates automatically when theme is switched
  - Includes 28+ translated strings per language:
    - App titles and subtitles
    - Button labels and instructions
    - Modal dialogs and feature descriptions
    - Error messages and guidance text
  - Translation system uses `utils/translations.ts` with `getTranslation()` helper
  - Button theme labels remain in English, but all other content translates
- **Dynamic theme colors with authentic flag colors**
  - American: Pure Crimson Red (#DC143C) and Blue (#0000FF)
  - Indian: Saffron (#FF9933) and Green (#138808)
  - Filipino: Blue (#0038A8) and Red (#CE1126)
  - Chinese: Red (#DE2910) and Yellow (#FFDE00)
  - Spanish: Red (#C60B1E) and Yellow (#FFC400)
  - Arabic: Red (#EE161F), Green (#00732F), and Black (#000000)
  - All buttons use theme-specific gradient colors
- **Authentic mini flag icons in header**
  - Each theme displays its proper national flag in the top-left corner
  - Flags are rendered with authentic designs matching official specifications
  - Flag dynamically switches when user changes theme
- **Theme persistence and easy switching**
  - Theme selection persists using AsyncStorage
  - Modal selector with all 6 theme options
  - One-tap theme switching with instant visual feedback
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
