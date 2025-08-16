# Sales Dashboard - MySQL XAMPP Deployment Guide

## Overview
Complete Sales Dashboard application optimized for TV display (50-meter viewing distance) with MySQL database backend. This production version runs on XAMPP with Apache server and includes comprehensive admin panel for data management.

## Features
- **Real-time Dashboard**: TV-optimized scoreboard with agent performance, team rankings, and automatic scrolling
- **MySQL Database**: Persistent data storage with relational tables for teams, agents, sales, and settings
- **Admin Panel**: Complete management interface for teams, agents, sales entry, and system configuration
- **Real-time Updates**: Live dashboard updates with sale notifications and progress tracking
- **Professional UI**: Modern, responsive design with dark theme and optimized typography

## File Structure
```
production/
├── dashboard-mysql.html     # Main TV dashboard (MySQL version)
├── admin-mysql.html        # Admin management panel (MySQL version)
├── api.php                 # MySQL database API endpoints
├── setup-mysql.php         # Database installation script
├── .htaccess              # Apache configuration
├── index.html             # Dashboard (localStorage version - backup)
├── admin.html             # Admin (localStorage version - backup)
└── README-MYSQL-DEPLOYMENT.md
```

## Quick Start

### 1. XAMPP Setup
1. Download and install XAMPP from https://www.apachefriends.org/
2. Start Apache and MySQL services in XAMPP Control Panel
3. Copy all production files to `C:\xampp\htdocs\sales-dashboard\`

### 2. Database Setup
1. Open browser and navigate to: `http://localhost/sales-dashboard/setup-mysql.php`
2. Wait for setup completion message
3. Database `sales_dashboard` will be created with all required tables
4. Default teams and agents will be added for demonstration

### 3. Access Application
- **TV Dashboard**: `http://localhost/sales-dashboard/dashboard-mysql.html`
- **Admin Panel**: `http://localhost/sales-dashboard/admin-mysql.html`
- **Database Management**: `http://localhost/phpmyadmin/` (optional)

## Database Schema

### Tables Created
- **companies**: Company information and currency settings
- **teams**: Sales teams with targets and colors
- **agents**: Individual agents with performance data
- **sales**: Sales transactions with client information
- **cash_offers**: Special promotional offers
- **announcements**: System announcements
- **news_ticker**: Scrolling news messages
- **settings**: System configuration

### Default Data
- Sample teams: "Alpha Team", "Beta Squad"
- Sample agents: "Sarah Johnson", "Mike Chen"
- Default currency: Sri Lankan Rupee (LKR)
- News ticker with motivational messages
- Basic system settings

## Admin Panel Usage

### Team Management
1. Navigate to Teams tab
2. Add teams with names, colors, and monthly targets
3. Teams automatically calculate daily targets
4. Delete teams (agents become unassigned)

### Agent Management
1. Navigate to Agents tab
2. Add agents with names, team assignment, and individual targets
3. Upload agent photos via URL
4. Track individual performance metrics

### Sales Entry
1. Navigate to Quick Sale tab
2. Select agent from dropdown
3. Enter sale amount, units, and client name
4. Sale automatically updates agent and team statistics
5. Real-time dashboard refresh

### Data Management
1. Update news ticker messages
2. Access database setup tools
3. Refresh data connections

### Settings
1. Configure company name and currency
2. Adjust dashboard auto-scroll timing
3. Set working days per month for calculations

## TV Display Setup

### Optimal Viewing
- **Distance**: Optimized for 50-meter viewing
- **Font Sizes**: All text doubled for TV readability
- **Colors**: High contrast with professional color scheme
- **Layout**: Clean, minimal design with clear data hierarchy

### Auto-Features
- **Auto-scroll**: Cycles through agents every 6 seconds
- **Real-time Updates**: Live data refresh every 30 seconds
- **Sale Notifications**: Pop-up celebrations for new sales
- **Progress Tracking**: Visual progress bars with color coding

## Technical Specifications

### Database (MySQL)
- Engine: InnoDB
- Charset: UTF8MB4
- Automatic timestamps on all tables
- Foreign key relationships maintained
- Transaction support for data integrity

### API Layer (PHP)
- RESTful endpoints for all operations
- JSON data format
- Error handling and validation
- CORS headers for cross-origin requests

### Frontend (React)
- React 18 with Babel transpilation
- Responsive Tailwind CSS styling
- Real-time WebSocket-style updates
- Progressive enhancement

### Performance
- Optimized queries with proper indexing
- Efficient API calls with caching
- Smooth animations and transitions
- Minimal resource usage

## Network Setup

### Local Network Access
To access from other devices on your network:

1. Find your computer's IP address:
   ```bash
   ipconfig
   ```

2. Access dashboard from any device:
   ```
   http://[YOUR-IP]/sales-dashboard/dashboard-mysql.html
   ```

3. Configure XAMPP for network access:
   - Edit `C:\xampp\apache\conf\httpd.conf`
   - Change `Listen 80` to `Listen 0.0.0.0:80`
   - Restart Apache service

### Firewall Configuration
1. Open Windows Firewall
2. Allow Apache HTTP Server through firewall
3. Allow MySQL Server through firewall (if accessing phpMyAdmin remotely)

## Security Considerations

### Production Deployment
- Change default MySQL root password
- Create dedicated database user with limited privileges
- Enable HTTPS with SSL certificate
- Configure proper .htaccess security headers
- Regular database backups

### Access Control
- Admin panel has no authentication (add if needed)
- Database credentials stored in php files
- Consider IP restriction for admin access

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Ensure MySQL service is running in XAMPP
- Run setup-mysql.php to create database
- Check MySQL credentials in api.php

**Dashboard Not Loading**
- Verify Apache service is running
- Check browser console for JavaScript errors
- Ensure all files are in correct directory

**Admin Panel Not Saving**
- Check database connection status
- Verify API endpoints are accessible
- Check browser network tab for failed requests

**Real-time Updates Not Working**
- Refresh page to re-establish connection
- Check MySQL service status
- Verify API endpoints returning valid JSON

### Debug Mode
Enable debug by adding to api.php:
```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

## Backup and Maintenance

### Database Backup
1. Export via phpMyAdmin:
   - Access `http://localhost/phpmyadmin/`
   - Select `sales_dashboard` database
   - Click Export > Go

2. Or use mysqldump:
   ```bash
   mysqldump -u root sales_dashboard > backup.sql
   ```

### File Backup
- Copy entire production folder
- Include XAMPP configuration files if customized

### Regular Maintenance
- Clean old sales data periodically
- Monitor database size
- Update agent photos as needed
- Review and update news ticker messages

## Customization

### Branding
- Modify company name in admin panel
- Update currency symbol and formatting
- Customize team colors and names

### Display Options
- Adjust auto-scroll intervals
- Modify agents per page display
- Change working days calculations

### Styling
- Edit CSS in HTML files for visual changes
- Modify color schemes and fonts
- Adjust layout for different screen sizes

## Support

### Development
- Built with modern web technologies
- Fully responsive design
- Cross-browser compatible

### Compatibility
- Chrome, Firefox, Safari, Edge
- Windows, Mac, Linux
- Desktop, tablet, mobile

### Version Information
- React 18
- Tailwind CSS 3
- PHP 7.4+
- MySQL 5.7+
- Apache 2.4+

---

**Note**: This is a complete production application with full MySQL database integration. Both localStorage and MySQL versions are provided for different deployment scenarios.