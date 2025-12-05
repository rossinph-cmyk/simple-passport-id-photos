# EZ Passport ID Photo Maker

Create professional passport ID photos in seconds with AI-powered framing and automatic background removal.

## Recent Updates

### File System API Fix (Latest)
- Reverted to using legacy `expo-file-system/legacy` API in preview.tsx to avoid C++ exceptions
- Removed unnecessary file copy operations in camera.tsx that were causing runtime errors
- Simplified camera flow to use temporary URIs directly
- Fixed all file operations to use stable legacy API methods:
  - `FileSystem.downloadAsync()` for downloads
  - `FileSystem.readAsStringAsync()` with Base64 encoding for reading files
  - `FileSystem.cacheDirectory` for temporary files
- All type errors resolved and app is stable
