# Color Sync Implementation - Mobile & Web

## Overview
Implemented full bidirectional color synchronization between mobile app and web platform for the primary color feature in Account > Settings > Appearance.

## Implementation Date
December 28, 2025

## Features Implemented

### 1. **Mobile Color Persistence**
- Manual AsyncStorage persistence (avoiding zustand persist middleware to prevent modal close issues)
- Color saved locally on device immediately when changed
- Color restored on app restart from AsyncStorage

### 2. **Backend Synchronization**
- Auto-save to backend: Color changes saved to `/crm/users/me/preferences` with 100ms debounce
- Load on mount: Preferences loaded from backend when user logs in
- Field: `primary_color` in preferences payload

### 3. **Real-time Sync from Web**
- Polling interval: Every 5 seconds
- Intelligently paused when user is actively on the appearance settings page
- Detects color changes made on web and syncs to mobile
- Updates global theme store when changes detected

### 4. **Color Picker Functionality**
- 16 color options in flex-wrap grid layout
- Instant visual feedback with border on selected color
- Direct state updates without ScrollView interference
- TouchableOpacity for reliable touch handling

## Files Modified

### `/mobile-app/src/store/themeStore.ts`
- Added manual AsyncStorage save function: `saveColorToStorage()`
- Added load function: `loadPersistedColor()` - runs on app start
- Color automatically persisted to AsyncStorage on every change
- No zustand persist middleware (avoids modal close bug)

### `/mobile-app/src/screens/ProfileSheet.tsx`
- **Load preferences on mount** (lines 340-385): Loads `primary_color` and other preferences from backend
- **Auto-save effect** (lines 390-418): Saves color changes to backend with 100ms debounce
- **Polling effect** (lines 420-444): Polls backend every 5s to sync changes from web
- **Color picker UI** (lines 1154-1192): 16 colors in flex-wrap grid with TouchableOpacity

### `/mobile-app/src/lib/api.ts`
- `updatePreferences()`: PUT to `/crm/users/me/preferences` with graceful 404 handling
- `getPreferences()`: GET from `/crm/users/me/preferences` with error handling

## Sync Flow

### Mobile → Web
1. User taps color in mobile app
2. Local state updated instantly (UI feedback)
3. Global theme store updated via `setPrimaryColor()`
4. AsyncStorage saves color locally (manual, non-blocking)
5. After 100ms debounce, color saved to backend API
6. Web polls and picks up the change

### Web → Mobile
1. User changes color on web
2. Web saves to backend immediately (300ms debounce)
3. Mobile polls backend every 5 seconds
4. If color differs, mobile updates global theme store
5. Local color syncs with global color via useEffect
6. AsyncStorage updated with new color

### On App Start
1. `loadPersistedColor()` runs immediately, loads from AsyncStorage
2. User's last selected color restored instantly
3. On mount, ProfileSheet loads preferences from backend
4. Backend value overrides local if different (ensuring consistency)

## Technical Details

### Debounce Timings
- **Mobile auto-save**: 100ms (fast, user on mobile expects instant sync)
- **Web auto-save**: 300ms (slightly slower, less frequent changes expected)
- **Polling interval**: 5000ms (5 seconds)

### Intelligent Polling
Polling is paused when:
- User is on Settings > Appearance tab
- Prevents overwriting user's active color selection
- Resumes when user navigates away

### Error Handling
- Backend API returns 404: Gracefully caught, returns null
- AsyncStorage failures: Logged to console, doesn't crash app
- Polling failures: Logged, next poll attempt continues

## Benefits
✅ Colors sync seamlessly between mobile and web  
✅ Changes appear on other devices within 5 seconds  
✅ Local persistence ensures instant app startup  
✅ No modal close issues (manual persistence avoids zustand persist bug)  
✅ Intelligent polling prevents overwriting active changes  
✅ Graceful degradation if backend unavailable  

## Testing Checklist
- [ ] Change color on mobile → verify saves to backend → verify appears on web
- [ ] Change color on web → verify mobile picks up change within 5s
- [ ] Close and reopen mobile app → verify color persists
- [ ] Change color while on appearance screen → verify no override from polling
- [ ] Navigate away from appearance → verify polling resumes
- [ ] Test with backend unavailable → verify graceful degradation

## Known Limitations
- 5-second polling delay for web → mobile sync (acceptable for most use cases)
- Manual AsyncStorage persistence (not automatic like zustand persist)
- Backend endpoint must be available for cross-device sync

## Future Enhancements
- WebSocket support for instant bidirectional sync
- Optimistic UI updates with rollback on failure
- Sync conflict resolution for simultaneous changes
- Extended preference syncing (fonts, theme mode, etc.)
