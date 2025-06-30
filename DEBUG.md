# Debugging Guide for Tavasit Calculator

This guide provides multiple ways to debug the Tavasit calculator application.

## 🚀 Quick Start Debugging

### 1. Browser Developer Tools
- Open your browser's Developer Tools (F12)
- Go to the Console tab
- Navigate through the calculator and watch the detailed logs
- Look for emoji-prefixed messages like 🚀, 🔍, 🧮, etc.

### 2. Visual Debug Panel
- Click the "🐛 Debug" button in the bottom-right corner
- This shows real-time state information
- Toggle visibility as needed

## 🔧 VS Code Debugging

### Setup
1. Install the Chrome Debugger extension in VS Code
2. Use the debug configurations in `.vscode/launch.json`

### Debug Configurations
- **Next.js: debug server-side** - Debug server-side code
- **Next.js: debug client-side** - Debug client-side React code
- **Next.js: debug full stack** - Debug both server and client

### How to Use
1. Set breakpoints in your code
2. Press F5 or go to Run and Debug
3. Select the appropriate configuration
4. Start debugging

## 📝 Console Logging

The app includes comprehensive logging:

### State Changes
```javascript
🔍 Debug - Current page: 1 Previous page: 1
🔍 Debug - Form data: { rainEvent: true, ... }
```

### Navigation
```javascript
🚀 handleNext fired at page: 1
🌧️ Rain event decision: true
➡️ Going to next page (rain event confirmed)
```

### Calculations
```javascript
🧮 Starting Tavasit calculation...
🌡️ Temperature thresholds for olive type: HS [12, 18]
🌧️ Total rain amount: 25 mm
🌡️ Average temperature: 15 °C
✅ Treatment recommended - infection event occurred
```

## 🛠️ Development Scripts

### Enhanced Debug Mode
```bash
npm run dev:debug
# or
pnpm dev:debug
```

This runs Next.js with Node.js inspector enabled for better debugging.

### Regular Development
```bash
npm run dev
# or
pnpm dev
```

## 🔍 Debug Utilities

Import debug utilities from `lib/debug.ts`:

```javascript
import { debugLog, debugError, logStateChange } from '@/lib/debug';

// Log messages (only in development)
debugLog('User clicked button', { buttonId: 'next' });

// Log errors
debugError('Failed to calculate', error);

// Log state changes
logStateChange('TavasitCalculator', 'currentPage', oldPage, newPage);
```

## 🐛 Common Debugging Scenarios

### 1. Page Navigation Issues
- Check console for navigation logs
- Verify `currentPage` state in debug panel
- Look for conditional logic in `handleNext()`

### 2. Form Data Problems
- Use debug panel to inspect `formData`
- Check console for form validation logs
- Verify data types and structure

### 3. Calculation Errors
- Look for calculation logs in console
- Check temperature and rain data
- Verify olive type sensitivity mappings

### 4. UI Rendering Issues
- Check browser dev tools for React errors
- Use React Developer Tools extension
- Verify component props and state

## 🔧 Advanced Debugging

### React Developer Tools
1. Install React Developer Tools browser extension
2. Open Developer Tools
3. Go to Components tab
4. Inspect component state and props

### Network Debugging
- Use Network tab in browser dev tools
- Check for failed requests
- Monitor API calls

### Performance Debugging
- Use Performance tab in browser dev tools
- Profile component re-renders
- Check for memory leaks

## 📊 Debug Panel Features

The debug panel shows:
- Current page number
- Complete form data
- Rain amount and temperature inputs
- Rain-temperature pairs
- Real-time updates

## 🚨 Troubleshooting

### Debug Panel Not Showing
- Check if component is imported correctly
- Verify CSS classes are not hidden
- Check z-index values

### Console Logs Not Appearing
- Ensure you're in development mode
- Check browser console settings
- Verify no console filters are active

### VS Code Debugger Not Working
- Check if Chrome is installed
- Verify launch.json configuration
- Ensure no other debugger is running

## 📚 Additional Resources

- [Next.js Debugging](https://nextjs.org/docs/advanced-features/debugging)
- [React Developer Tools](https://react.dev/learn/react-developer-tools)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [VS Code Debugging](https://code.visualstudio.com/docs/editor/debugging) 