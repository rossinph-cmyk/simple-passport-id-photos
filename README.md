# EZ Passport ID Photo Maker

Create professional passport ID photos in seconds with AI-powered framing and automatic background removal.

## Recent Updates

### File System Migration (Latest)
- Migrated from legacy `expo-file-system/legacy` API to modern `expo-file-system` API
- Updated file operations to use `File` and `Paths` classes
- Fixed C++ exception errors related to deprecated legacy API
- All file system operations now use:
  - `new File(uri)` for file references
  - `Paths.cache` and `Paths.document` for directory paths
  - `File.downloadFileAsync()` for downloads
  - `file.base64()` for base64 encoding
  - `file.exists` property for existence checks
