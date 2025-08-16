# Sales Dashboard - Production Ready Application

## Overview

This is a complete production-ready sales dashboard application that runs on XAMPP Apache server without requiring Node.js or npm commands. The application includes all the features of the original npm version but works entirely with static HTML files and local storage.

## Features

✅ **Complete TV Dashboard** - Optimized for 50-meter viewing distance  
✅ **Real-time Updates** - Uses localStorage with live updates  
✅ **Admin Panel** - Full CRUD operations for teams, agents, and sales  
✅ **Data Management** - Import/export functionality  
✅ **Responsive Design** - Works on desktop, tablet, and TV displays  
✅ **No Backend Required** - Runs entirely client-side  
✅ **XAMPP Compatible** - Works with Apache server  

## Installation on XAMPP

### Step 1: Copy Files
1. Copy all files from the `production` folder to your XAMPP `htdocs` directory
2. Create a folder like `htdocs/sales-dashboard/`
3. Place all production files inside this folder

### Step 2: Start XAMPP
1. Open XAMPP Control Panel
2. Start **Apache** service
3. Optionally start **MySQL** (not required for this application)

### Step 3: Access the Application
- **Main Dashboard**: `http://localhost/sales-dashboard/`
- **Admin Panel**: `http://localhost/sales-dashboard/admin.html`

## File Structure

```
production/
├── index.html          # Main TV dashboard
├── admin.html          # Admin management panel
├── .htaccess           # Apache configuration
├── README.md           # This file
└── assets/             # Static assets (if any)
```

## Usage

### Main Dashboard (`index.html`)
- **Purpose**: Large screen TV display for sales teams
- **Features**: 
  - Auto-scrolling agent list
  - Real-time progress tracking
  - Team rankings
  - Daily targets breakdown
  - News ticker
  - Admin toggle button (⚙️ Admin)

### Admin Panel (`admin.html`)
- **Purpose**: Management interface for administrators
- **Features**:
  - **Teams Tab**: Add, edit, delete teams
  - **Agents Tab**: Manage sales agents
  - **Sales Tab**: Record new sales and view history
  - **Settings Tab**: Configure company info, display settings, news ticker

## Data Management

### Local Storage
- All data is stored in the browser's localStorage
- Data persists between browser sessions
- Shared between dashboard and admin panel on the same domain

### Import/Export
- **Export**: Download complete data as JSON file
- **Import**: Upload JSON file to restore data
- Data format is compatible between different installations

### Sample Data
The application comes with pre-loaded sample data including:
- 5 teams with different colors and targets
- 6 sample agents with various performance levels
- Configurable settings and news ticker messages

## Customization

### Company Branding
Edit in Admin Panel → Settings Tab:
- Company name
- Currency symbol
- News ticker messages

### Display Settings
Configure in Admin Panel → Settings Tab:
- Auto-scroll interval (milliseconds)
- Agents per page
- Working days per month

### Visual Customization
Edit CSS in `index.html` or `admin.html`:
- Colors and themes
- Font sizes
- Layout adjustments

## Browser Compatibility

✅ Chrome 80+  
✅ Firefox 75+  
✅ Safari 13+  
✅ Edge 80+  

## TV/Large Screen Setup

### For TV Display:
1. Open `http://localhost/sales-dashboard/` on TV browser
2. Press F11 for fullscreen mode
3. The dashboard will auto-scroll and update in real-time

### For Call Centers:
- Use Chrome in kiosk mode: `chrome --kiosk --app=http://localhost/sales-dashboard/`
- Set browser to prevent sleep/screensaver
- Configure TV to display 1920x1080 or higher resolution

## Security Considerations

### Local Network Only
- This application is designed for local network use
- Do not expose directly to the internet without proper security measures

### Data Privacy
- All data is stored locally in browser
- No data is transmitted to external servers
- Regular backups recommended using export feature

## Troubleshooting

### Dashboard Not Loading
1. Check Apache is running in XAMPP
2. Verify files are in correct htdocs directory
3. Check browser console for JavaScript errors

### Admin Panel Issues
1. Clear browser cache and localStorage
2. Check if localStorage is enabled in browser
3. Try importing fresh data using sample JSON

### Performance Issues
1. Limit number of agents to < 20 for smooth scrolling
2. Clear old sales data periodically
3. Use modern browser with hardware acceleration

## Advanced Configuration

### Apache Optimization
The included `.htaccess` file provides:
- Compression for faster loading
- Caching headers for static assets
- Security headers
- Clean URLs (`/admin` redirects to `admin.html`)

### Custom Deployment
For production deployment:
1. Use a dedicated web server
2. Configure SSL/HTTPS
3. Set up automated backups
4. Consider reverse proxy for multiple locations

## Support

This application is self-contained and doesn't require external dependencies. All functionality is implemented using:
- HTML5 for structure
- CSS3 for styling
- JavaScript (ES6+) for functionality
- React (CDN) for UI components
- Tailwind CSS (CDN) for styling

For technical issues, check the browser console for error messages and ensure all files are properly uploaded to the web server.

## Data Format

The application uses a JSON structure for all data:

```json
{
  "company": {
    "name": "SALES LEADERBOARD",
    "currency": { "symbol": "LKR", "code": "LKR" }
  },
  "teams": [...],
  "agents": [...],
  "sales": [...],
  "settings": {...},
  "newsTicker": [...]
}
```

This format is compatible with the original npm version and can be imported/exported between different installations.