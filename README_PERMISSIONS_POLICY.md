# PERMISSIONS POLICY - DO NOT IGNORE

## CRITICAL RULES FOR AI ASSISTANT

**UNDER NO CIRCUMSTANCES** should the AI assistant modify permissions in `app.json` without **explicit written permission** from the developer.

### Forbidden Actions:
- ❌ Adding microphone permissions
- ❌ Adding vibrate permissions  
- ❌ Adding sound/audio permissions
- ❌ Adding READ_MEDIA permissions
- ❌ Adding READ_MEDIA_AUDIO permissions
- ❌ Adding READ_MEDIA_VIDEO permissions
- ❌ Adding ACCESS_MEDIA_LOCATION permissions
- ❌ Adding ANY permissions not explicitly requested by the developer

### Required Behavior:
- ✅ Only modify permissions when developer explicitly requests it in writing
- ✅ Ask for confirmation before adding any new permissions
- ✅ Never assume a feature needs a permission without asking first
- ✅ Check this file before making any changes to app.json

## History:
This policy was created because permissions were added to app.json without permission, which could result in App Store rejection or ban.

**Last Updated:** 2025-11-26
**Enforcement Level:** ABSOLUTE - No exceptions
