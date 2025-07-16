# FTP Deployment Guide - Sales Dashboard

## Overview
This guide will help you deploy the Real-Time Sales Leaderboard application to your FTP hosting site. The application uses SQLite database and is designed to work with standard hosting environments.

## Prerequisites

### Server Requirements
- Node.js (version 18 or higher)
- File upload/download capabilities via FTP
- Port access for the web server (typically port 3000 or 5000)
- WebSocket support for real-time features

### Files You Need to Upload
All files in your project directory, including:
- `database.sqlite` (your SQLite database file)
- All source code files
- `package.json` and `package-lock.json`
- `.env` file (create as shown below)

## Step 1: Prepare Your Files

### 1.1 Create Production Environment File
Create a `.env` file in your project root with these settings:

```
NODE_ENV=production
DATABASE_FILE=database.sqlite
SESSION_SECRET=your-secret-key-here-change-this-to-something-secure
PORT=5000
```

### 1.2 Update Package.json Scripts
Ensure your `package.json` has these scripts:

```json
{
  "scripts": {
    "start": "node server/index.js",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "esbuild server/index.ts --bundle --platform=node --target=node18 --outfile=server/index.js --external:better-sqlite3",
    "dev": "NODE_ENV=development tsx server/index.ts"
  }
}
```

## Step 2: Build for Production

### 2.1 Build the Application
Run these commands in your local development environment:

```bash
# Install dependencies
npm install

# Build the application
npm run build
```

This creates:
- `dist/` folder with built frontend files
- `server/index.js` - built server file

## Step 3: Upload to FTP Server

### 3.1 Upload All Files
Using your FTP client, upload these files and folders:

```
📁 Your FTP Directory/
├── 📁 dist/                    # Built frontend files
├── 📁 server/
│   ├── index.js               # Built server file
│   └── (other server files)
├── 📁 node_modules/           # Dependencies
├── 📁 uploads/                # File uploads directory
├── 📁 attached_assets/        # Sound files and assets
├── database.sqlite            # Your SQLite database
├── package.json
├── package-lock.json
├── .env                       # Environment variables
└── (other project files)
```

### 3.2 Set File Permissions
Ensure these permissions on your FTP server:
- `database.sqlite`: 644 (read/write for owner)
- `uploads/` folder: 755 (read/write/execute for owner)
- `server/index.js`: 755 (executable)

## Step 4: Install Dependencies on Server

### 4.1 SSH into Your Server
Connect to your server via SSH:

```bash
ssh username@your-server-domain.com
```

### 4.2 Navigate to Your Project Directory
```bash
cd /path/to/your/project
```

### 4.3 Install Node.js Dependencies
```bash
npm install --production
```

## Step 5: Start the Application

### 5.1 Start the Server
```bash
npm start
```

### 5.2 Run as Background Process (Recommended)
Use PM2 or similar process manager:

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start server/index.js --name "sales-dashboard"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on server reboot
pm2 startup
```

## Step 6: Access Your Application

### 6.1 Main Dashboard
- URL: `http://your-domain.com:5000`
- This is the main TV dashboard for displaying on large screens

### 6.2 Admin Panel
- URL: `http://your-domain.com:5000/admin-portal`
- Login: `admin` / `admin123`

## Step 7: Configuration

### 7.1 Admin Panel Setup
1. Go to `/admin-portal`
2. Login with admin credentials
3. Configure:
   - Team Management (create teams first)
   - Agent Management (add sales agents)
   - UI Customization (colors, currency, etc.)
   - Sound Effects (upload audio files)
   - Media Slides (company presentations)

### 7.2 Database Backup
Regularly backup your `database.sqlite` file:

```bash
# Create backup
cp database.sqlite database_backup_$(date +%Y%m%d).sqlite

# Download backup via FTP
# Use your FTP client to download the backup file
```

## Step 8: Domain Setup (Optional)

### 8.1 Custom Domain
If you want to use a custom domain:

1. Point your domain to your server IP
2. Update your DNS records
3. Access via: `http://your-domain.com:5000`

### 8.2 Remove Port from URL
To access without port number, configure a reverse proxy:

#### Using Apache (.htaccess)
```apache
RewriteEngine On
RewriteRule ^(.*)$ http://localhost:5000/$1 [P,L]
```

#### Using Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Troubleshooting

### Common Issues

#### 1. Database Permission Errors
```bash
# Fix database permissions
chmod 644 database.sqlite
chown www-data:www-data database.sqlite
```

#### 2. Port Already in Use
```bash
# Check what's using the port
lsof -i :5000

# Kill process if needed
kill -9 <process-id>
```

#### 3. Node.js Not Found
```bash
# Install Node.js (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### 4. WebSocket Connection Issues
Ensure your hosting provider supports WebSocket connections. Some shared hosting providers block WebSocket traffic.

### Support Commands

#### Check Application Status
```bash
# Check if process is running
pm2 status

# View logs
pm2 logs sales-dashboard

# Restart application
pm2 restart sales-dashboard
```

#### Database Maintenance
```bash
# Check database file
ls -la database.sqlite

# Backup database
cp database.sqlite "backup_$(date +%Y%m%d_%H%M%S).sqlite"
```

## Security Considerations

1. **Change Default Credentials**: Update admin username/password
2. **Secure Database**: Ensure `database.sqlite` is not publicly accessible
3. **Environment Variables**: Keep `.env` file secure
4. **Regular Backups**: Backup your database regularly
5. **SSL Certificate**: Consider adding HTTPS for production use

## Performance Optimization

1. **Enable Gzip**: Configure your web server to compress responses
2. **Static File Caching**: Cache static assets
3. **Database Optimization**: SQLite is lightweight and fast for this use case
4. **Process Management**: Use PM2 for automatic restarts and clustering

## Need Help?

If you encounter issues:
1. Check the server logs: `pm2 logs sales-dashboard`
2. Verify file permissions
3. Ensure Node.js and npm are properly installed
4. Check if your hosting provider supports Node.js applications

Your sales dashboard should now be running on your FTP server and accessible via your domain!