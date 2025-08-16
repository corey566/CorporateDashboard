# Standalone Sales Dashboard - TV Display

## Quick Start

1. **Download the files:**
   - `standalone-dashboard.html` (basic version with built-in sample data)
   - `standalone-dashboard-configurable.html` (advanced version with external config)
   - `dashboard-config.js` (configuration file for the advanced version)

2. **Simple Version:**
   - Just open `standalone-dashboard.html` in any modern web browser
   - The dashboard will start immediately with sample data

3. **Configurable Version:**
   - Make sure both `standalone-dashboard-configurable.html` and `dashboard-config.js` are in the same folder
   - Open `standalone-dashboard-configurable.html` in your browser

## Features

✓ **Optimized for 50-meter TV viewing distance** - Extra large fonts and high contrast  
✓ **Football scoreboard-style layout** - Professional table design  
✓ **Auto-scrolling agents** - Shows 2 agents at a time, cycles every 6 seconds  
✓ **Team rankings** - Real-time team performance comparison  
✓ **Daily targets breakdown** - Shows daily volume and units targets  
✓ **Progress bars** - Color-coded performance indicators  
✓ **News ticker** - Scrolling motivational messages  
✓ **Real-time clock** - Current date and time display  
✓ **No internet required** - Works completely offline  

## Customizing Your Data

### For Simple Version:
Edit the `sampleData` object directly in `standalone-dashboard.html`

### For Configurable Version:
Edit `dashboard-config.js` to customize:

**Teams:**
```javascript
teams: [
    { id: 1, name: "Your Team Name", color: "#3B82F6", volumeTarget: "500000.00", unitsTarget: 10 }
]
```

**Agents:**
```javascript
agents: [
    {
        id: 1,
        name: "Agent Name",
        photo: "https://your-photo-url.com/photo.jpg",
        teamId: 1,
        category: "Category",
        volumeTarget: "300000.00",
        unitsTarget: 8,
        volumeAchieved: "200000.00",
        unitsAchieved: 5,
        totalSales: 12
    }
]
```

**Currency:**
```javascript
company: {
    name: "Your Company Name",
    currency: {
        symbol: "$",
        code: "USD",
        name: "US Dollar"
    }
}
```

**Display Settings:**
```javascript
display: {
    autoScrollInterval: 6000,    // milliseconds between scrolling
    agentsPerPage: 2,           // agents shown at once
    workingDaysPerMonth: 22     // for daily target calculations
}
```

## TV/ATV Setup

1. **Upload to cloud storage** (Google Drive, Dropbox, etc.) or web server
2. **Open on your TV browser** or use screen mirroring
3. **Set to fullscreen mode** (F11 on most browsers)
4. **Ensure auto-refresh is disabled** in browser settings

## Browser Compatibility

✓ Chrome 80+  
✓ Firefox 75+  
✓ Safari 13+  
✓ Edge 80+  

## Troubleshooting

**Dashboard not loading?**
- Check that both HTML and JS files are in the same folder (configurable version)
- Try a different browser
- Check browser console for errors (F12)

**Images not showing?**
- Use direct image URLs (not file paths)
- Ensure images are publicly accessible
- Use placeholder service: `https://via.placeholder.com/96x96/COLOR/FFFFFF?text=LETTER`

**Text too small/large?**
- Adjust browser zoom (Ctrl + / Ctrl -)
- Modify font sizes in CSS section of HTML file

## Performance Tips

- Use compressed images (< 100KB each)
- Keep agent list under 20 for smooth scrolling
- Test on your target TV/browser before deployment
- Consider using a local web server for better performance

## Support

This is a standalone version that works without any server or npm commands. Simply open the HTML file in a web browser and it will work immediately.

The dashboard is designed specifically for call centers and sales teams who need a large-screen display that's readable from 50 meters away.