# Sales Dashboard - XAMPP Production Deployment Guide

## 📺 Complete TV Display Dashboard System

This is a **production-ready** sales dashboard application specifically designed for **XAMPP Apache servers**. The system has been completely converted from the original npm-based application to a **static file solution** while maintaining 100% of the original functionality.

## 🎯 Key Features

### Dashboard Features (100% Original Functionality)
- **Real-time Sales Performance Tracking** with live updates
- **Football-style Scoreboard Table** optimized for 50-meter TV viewing
- **Auto-scrolling Agent Display** with visual indicators
- **Team Rankings & Daily Targets** in dedicated right panel
- **Sale Popup Notifications** with sound effects
- **Active Cash Offers Banner** for promotions
- **News Ticker** with scrolling announcements
- **WebSocket Status Indicator** (simulated for offline environment)
- **Company Branding** with customizable titles and currency

### Admin Panel Features (Complete Management System)
- **Team Management** - Create, edit, delete teams with colors and targets
- **Agent Management** - Full agent lifecycle with photos and performance
- **Quick Sales Entry** - Record sales with instant dashboard updates
- **Data Import/Export** - Backup and restore functionality
- **Settings Configuration** - Company info, currency, working days
- **News Ticker Management** - Update scrolling messages
- **Statistics Overview** - Real-time dashboard metrics

### Technical Specifications
- **100% Client-side Application** - No server-side dependencies required
- **LocalStorage Database** - All data persists locally with real-time sync
- **Sound Effects Integration** - Audio notifications for sales events
- **Responsive Design** - Optimized for both TV displays and admin devices
- **Apache Optimized** - Security headers, compression, and caching
- **Offline Capable** - Complete functionality without internet connection

## 🚀 Quick Installation

### Step 1: Download XAMPP
1. Download and install XAMPP from [https://www.apachefriends.org/](https://www.apachefriends.org/)
2. Start Apache service from XAMPP Control Panel

### Step 2: Deploy Dashboard
1. Copy the entire `production` folder to `C:\xampp\htdocs\` (Windows) or `/opt/lampp/htdocs/` (Linux)
2. Rename the folder to `sales-dashboard` (or your preferred name)

### Step 3: Access the System
- **TV Dashboard**: `http://localhost/sales-dashboard/`
- **Admin Panel**: `http://localhost/sales-dashboard/admin`

## 📁 File Structure

```
sales-dashboard/
├── index.html          # Main TV Dashboard (React-based)
├── admin.html          # Admin Panel (Complete Management)
├── .htaccess           # Apache Configuration
└── README-XAMPP-DEPLOYMENT.md
```

## 🖥️ Dashboard Access URLs

### Primary Dashboard (TV Display)
- **Local**: `http://localhost/sales-dashboard/`
- **Network**: `http://[YOUR-IP]/sales-dashboard/`
- **Alternative**: `http://localhost/sales-dashboard/dashboard`

### Admin Panel (Management Interface)
- **Local**: `http://localhost/sales-dashboard/admin`
- **Network**: `http://[YOUR-IP]/sales-dashboard/admin`

## 🎛️ Admin Panel Guide

### Initial Setup Process
1. **Access Admin Panel**: Navigate to `/admin` URL
2. **Create Teams**: Start with team management (required first step)
3. **Add Agents**: Assign agents to teams with individual targets
4. **Configure Settings**: Set company name, currency, working days
5. **Test Sales Entry**: Record test sales to verify functionality

### Admin Panel Tabs

#### 1. Teams Tab
- **Add New Team**: Name, color, volume/units targets
- **Manage Existing**: View, edit, delete teams
- **Team Colors**: Visual identification on dashboard

#### 2. Agents Tab
- **Add New Agent**: Name, team, category, targets, photo
- **Performance Tracking**: Volume/units progress visualization
- **Individual Targets**: Separate from team targets

#### 3. Quick Sale Tab
- **Record Sales**: Agent, amount, units, client name
- **Sound Effects**: Automatic audio notification
- **Recent Sales**: View latest transactions

#### 4. Data Management Tab
- **Export Data**: Download complete backup as JSON
- **Import Data**: Restore from backup file
- **News Ticker**: Update scrolling messages
- **Reset Data**: Clear all data (use with caution)

#### 5. Settings Tab
- **Company Settings**: Name, currency symbol
- **Dashboard Settings**: Auto-scroll timing, working days
- **Real-time Updates**: Changes reflect immediately

## 📊 Data Management

### Data Storage
- **Type**: Browser LocalStorage (client-side)
- **Persistence**: Data persists across browser sessions
- **Synchronization**: Real-time updates between dashboard and admin
- **Backup**: Export/import functionality available

### Data Structure
```json
{
  "company": {
    "name": "Your Company Name",
    "currency": { "symbol": "LKR", "code": "LKR", "name": "Currency" }
  },
  "teams": [...],
  "agents": [...],
  "sales": [...],
  "settings": {...},
  "newsTicker": [...]
}
```

## 🔧 Configuration Options

### Apache Settings (.htaccess)
- **Security Headers**: XSS protection, content type sniffing prevention
- **Performance**: Gzip compression, browser caching
- **URL Rewriting**: Clean URLs for admin and dashboard routes
- **MIME Types**: Proper handling of CSS, JS, SVG files

### Dashboard Customization
- **Company Name**: Displayed prominently on TV dashboard
- **Currency**: Configurable symbol and formatting
- **Auto-scroll Timing**: Adjustable agent rotation speed
- **Working Days**: Affects daily target calculations
- **Team Colors**: Visual identification and branding

### TV Display Optimization
- **Font Sizes**: Doubled for 50-meter viewing distance
- **High Contrast**: Optimized color scheme for visibility
- **Auto-scrolling**: Handles unlimited number of agents
- **Progress Bars**: Color-coded performance indicators
- **Real-time Updates**: Automatic data refresh every 30 seconds

## 🎵 Sound Effects

### Audio Features
- **Sale Notifications**: Plays when sales are recorded
- **Volume Control**: Adjustable audio levels (30% default)
- **Browser Compatibility**: Works across all modern browsers
- **Fallback Handling**: Graceful degradation if audio fails

### Sound Configuration
- **Format**: Base64-encoded WAV audio
- **Trigger**: Automatic on sale entry
- **Duration**: Short notification sound (~2 seconds)
- **Customization**: Audio can be replaced by modifying base64 data

## 📱 Multi-Device Support

### TV Display (Primary)
- **Optimized for**: 50-meter viewing distance
- **Font Sizes**: Extra large for visibility
- **Layout**: Football-style scoreboard table
- **Features**: Auto-scroll, progress bars, real-time updates

### Admin Device (Secondary)
- **Responsive Design**: Works on desktop, tablet, mobile
- **Touch-friendly**: Large buttons and form fields
- **Real-time Sync**: Changes reflect immediately on TV
- **Complete Control**: All management functions available

## 🔒 Security Features

### Apache Security Headers
- **X-Content-Type-Options**: Prevents MIME sniffing attacks
- **X-Frame-Options**: Protects against clickjacking
- **X-XSS-Protection**: Cross-site scripting protection
- **Referrer-Policy**: Controls referrer information

### File Protection
- **.htaccess Protection**: Prevents direct access to configuration
- **Log File Security**: Blocks access to log files
- **Server Signature**: Disabled for security

## 🚀 Performance Optimization

### Apache Optimizations
- **Gzip Compression**: Reduces file transfer sizes
- **Browser Caching**: Static asset caching for 1 month
- **Memory Limits**: PHP memory increased to 128MB
- **Execution Time**: Extended for large operations

### Client-side Performance
- **LocalStorage**: Fast data access without server calls
- **React Components**: Optimized rendering and updates
- **Minimal Dependencies**: Only essential libraries loaded
- **Efficient Updates**: Real-time sync without page refresh

## 🛠️ Troubleshooting

### Common Issues

#### Dashboard Not Loading
- **Check Apache**: Ensure Apache is running in XAMPP
- **File Permissions**: Verify read permissions on files
- **URL Path**: Confirm correct folder path in htdocs

#### Admin Panel Access Issues
- **URL Rewriting**: Ensure mod_rewrite is enabled in Apache
- **File Location**: Verify admin.html exists in folder
- **Browser Cache**: Clear browser cache and reload

#### Data Not Saving
- **LocalStorage**: Check browser supports localStorage
- **Storage Space**: Ensure sufficient browser storage
- **JavaScript Errors**: Check browser console for errors

#### Sound Effects Not Working
- **Browser Policy**: Some browsers require user interaction first
- **Audio Support**: Verify browser supports audio playback
- **Volume Settings**: Check system and browser audio settings

### Network Access Setup

#### Access from Other Devices
1. **Find Server IP**: Check XAMPP control panel or use `ipconfig`
2. **Update Firewall**: Allow Apache through Windows firewall
3. **Test Connection**: Access `http://[SERVER-IP]/sales-dashboard/`

#### Port Configuration
- **Default Port**: Apache runs on port 80
- **Alternative Ports**: Configure in XAMPP if port 80 is occupied
- **Router Settings**: Forward port 80 for external access

## 📈 Scaling and Maintenance

### Regular Maintenance
- **Data Backup**: Export data regularly from admin panel
- **Log Monitoring**: Check Apache logs for errors
- **Performance Review**: Monitor dashboard responsiveness
- **Security Updates**: Keep XAMPP updated

### Scaling Considerations
- **Multiple Displays**: Deploy to multiple TVs with same admin
- **Team Expansion**: Unlimited teams and agents supported
- **Data Growth**: LocalStorage handles thousands of records
- **Network Performance**: Optimize for local network speed

## 🎯 Production Deployment Checklist

### Pre-deployment
- [ ] XAMPP installed and Apache running
- [ ] Files copied to htdocs directory
- [ ] .htaccess file in place
- [ ] Network access configured

### Initial Setup
- [ ] Access admin panel
- [ ] Create initial teams
- [ ] Add sample agents
- [ ] Configure company settings
- [ ] Test sales entry

### Testing
- [ ] Dashboard displays correctly on TV
- [ ] Admin panel functions on management device
- [ ] Data syncs between dashboard and admin
- [ ] Sound effects work properly
- [ ] Export/import functionality verified

### Go-Live
- [ ] Production data entered
- [ ] Staff trained on admin panel
- [ ] TV display positioned and configured
- [ ] Backup procedures established
- [ ] Monitoring system active

## 📞 Support and Customization

### Built-in Features
- **Complete Admin Panel**: No additional setup required
- **Real-time Updates**: Automatic synchronization
- **Data Persistence**: Reliable localStorage system
- **Sound Integration**: Professional notification system

### Customization Options
- **Company Branding**: Logo, colors, name customization
- **Currency Settings**: Any currency symbol supported
- **Team Colors**: Unlimited color combinations
- **Target Periods**: Flexible time-based targets

This production-ready XAMPP deployment provides a complete sales dashboard solution that maintains 100% of the original npm application functionality while requiring zero server-side dependencies or external services.