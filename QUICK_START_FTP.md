# Quick Start - FTP Deployment

## Step 1: Prepare Files

1. **Copy the project files** from this Replit to your local computer
2. **Create .env file** with these settings:
   ```
   NODE_ENV=production
   DATABASE_FILE=database.sqlite
   SESSION_SECRET=your-secure-secret-key
   PORT=5000
   ```

## Step 2: Upload to FTP

Upload these files to your FTP server:
- All project files (entire folder)
- `database.sqlite` (your database)
- `.env` (environment settings)
- `package.json` and `package-lock.json`

## Step 3: Install & Run

SSH into your server and run:

```bash
# Navigate to your project folder
cd /path/to/your/project

# Install dependencies
npm install

# Start the application
npm start
```

## Step 4: Access

- **Dashboard**: `http://your-domain.com:5000`
- **Admin Panel**: `http://your-domain.com:5000/admin-portal`
- **Login**: username: `admin`, password: `admin123`

## Important Files:
- `database.sqlite` - Your SQLite database (backup regularly)
- `.env` - Environment configuration
- `server/index.js` - Main server file (auto-generated)

## Quick Commands:
```bash
# Start server
npm start

# Stop server (Ctrl+C)

# Check if running
ps aux | grep node

# Run in background
nohup npm start &
```

That's it! Your sales dashboard should be running on your FTP server.