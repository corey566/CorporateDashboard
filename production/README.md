# Sales Dashboard - Production Package
**Real-Time Sales Leaderboard for PHP Hosting Servers**

## 🚀 Quick Start Guide

### What's Included
This package contains everything needed to deploy a professional sales dashboard on any PHP hosting server with MySQL support.

### Two Deployment Options

1. **MySQL Database Version (Recommended)**
   - Full production deployment with persistent data
   - Real-time updates with MySQL database
   - Multi-user support and data persistence
   - Professional reporting and analytics

2. **Browser Storage Version (Backup)**
   - Standalone deployment with localStorage
   - No database required - instant setup
   - Single-user mode for demos or testing
   - Works offline once loaded

### 📁 Package Contents

```
production/
├── 🏠 home.html                    # Version selector page
├── 📊 dashboard-mysql.html         # MySQL TV dashboard
├── ⚙️ admin-mysql.html             # MySQL admin panel
├── 🔌 api.php                      # MySQL database API
├── 🛠️ setup-mysql.php              # Database installation
├── 📊 index.html                   # localStorage dashboard
├── ⚙️ admin.html                   # localStorage admin
├── ⚡ .htaccess                     # Apache configuration
├── 📁 uploads/                     # File upload directory
├── 📖 DEPLOYMENT-GUIDE.md          # Complete setup instructions
└── 📋 README.md                    # This file
```

### 🎯 Deployment Steps

1. **Upload Files**
   - Upload entire `production` folder to your web server
   - Ensure all files are in your domain's root directory

2. **Database Setup (MySQL Version)**
   - Create MySQL database in cPanel
   - Update database credentials in `api.php`
   - Run `/setup-mysql.php` to initialize database

3. **Access Your Dashboard**
   - Visit `/home.html` to choose version
   - MySQL: `/dashboard-mysql.html` (recommended)
   - Storage: `/index.html` (backup option)

### 📖 Complete Instructions
See `DEPLOYMENT-GUIDE.md` for detailed step-by-step instructions.

### 🎯 Key Features
- **Real-time Performance Tracking**: Live sales updates and team rankings
- **TV-Optimized Display**: Perfect for 50-meter viewing distance
- **Complete Admin Panel**: Manage teams, agents, sales, and settings
- **Multi-Currency Support**: Configurable currency symbols and formatting
- **Professional Reports**: Detailed analytics and performance metrics
- **Sound Notifications**: Audio alerts for sales and announcements
- **Responsive Design**: Works on all devices and screen sizes

### 🆘 Support
For deployment help, see the troubleshooting section in `DEPLOYMENT-GUIDE.md`.

---
**Ready to deploy? Start with the `DEPLOYMENT-GUIDE.md` for complete setup instructions.**