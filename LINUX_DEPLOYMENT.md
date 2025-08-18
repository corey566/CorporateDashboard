# Linux Server Deployment Guide

## System Requirements

- **Operating System**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **Memory**: Minimum 2GB RAM (4GB recommended)
- **Storage**: Minimum 10GB free space
- **Network**: Port 5000 access for the application

## Prerequisites Installation

### 1. Install Node.js 20+

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Install PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3. Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 4. Install Git

```bash
# Ubuntu/Debian
sudo apt install git

# CentOS/RHEL
sudo yum install git
```

## Database Setup

### 1. Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL shell:
CREATE DATABASE sales_dashboard;
CREATE USER dashboard_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE sales_dashboard TO dashboard_user;
ALTER USER dashboard_user CREATEDB;
\q
```

### 2. Configure PostgreSQL Access

```bash
# Edit pg_hba.conf
sudo nano /etc/postgresql/*/main/pg_hba.conf

# Add this line for local connections:
local   sales_dashboard   dashboard_user                    md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

## Application Deployment

### 1. Clone and Setup Application

```bash
# Create application directory
sudo mkdir -p /opt/sales-dashboard
sudo chown $USER:$USER /opt/sales-dashboard
cd /opt/sales-dashboard

# Clone your application files
# (Copy all files from your development environment)

# Install dependencies
npm install

# Install production dependencies only (optional)
npm ci --production
```

### 2. Environment Configuration

```bash
# Create production environment file
nano .env
```

Add the following content to `.env`:

```env
NODE_ENV=production
DATABASE_URL=postgresql://dashboard_user:your_secure_password@localhost:5432/sales_dashboard
SESSION_SECRET=your_very_long_random_session_secret_here
PGHOST=localhost
PGPORT=5432
PGUSER=dashboard_user
PGPASSWORD=your_secure_password
PGDATABASE=sales_dashboard

# Optional: Object Storage (if using cloud storage)
# DEFAULT_OBJECT_STORAGE_BUCKET_ID=your_bucket_id
# PRIVATE_OBJECT_DIR=your_private_dir
# PUBLIC_OBJECT_SEARCH_PATHS=your_public_paths
```

### 3. Database Schema Migration

```bash
# Push database schema
npm run db:push
```

### 4. Create Initial Admin User

```bash
# Connect to database and create admin user
psql -U dashboard_user -d sales_dashboard -h localhost

-- In PostgreSQL shell:
INSERT INTO users (username, password) VALUES 
('admin', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa');

-- Insert default categories
INSERT INTO categories (name, color, description) VALUES 
('Software', '#3B82F6', 'Software products and services'),
('Hardware', '#10B981', 'Hardware products and equipment'),
('Consulting', '#F59E0B', 'Consulting and professional services'),
('Support', '#8B5CF6', 'Customer support and maintenance'),
('Training', '#EF4444', 'Training and education services');

\q
```

### 5. Build Application

```bash
# Build the frontend
npm run build
```

## Production Deployment

### Option 1: PM2 (Recommended)

```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

Add this content:

```javascript
module.exports = {
  apps: [{
    name: 'sales-dashboard',
    script: 'npm',
    args: 'run dev',
    cwd: '/opt/sales-dashboard',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/var/log/pm2/sales-dashboard-error.log',
    out_file: '/var/log/pm2/sales-dashboard-out.log',
    log_file: '/var/log/pm2/sales-dashboard.log',
    time: true
  }]
};
```

```bash
# Create log directory
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
# Follow the instructions provided by the command above
```

### Option 2: Systemd Service

```bash
# Create systemd service file
sudo nano /etc/systemd/system/sales-dashboard.service
```

Add this content:

```ini
[Unit]
Description=Sales Dashboard Application
After=network.target postgresql.service

[Service]
Type=simple
User=your_username
WorkingDirectory=/opt/sales-dashboard
ExecStart=/usr/bin/npm run dev
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=5000

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable sales-dashboard
sudo systemctl start sales-dashboard

# Check service status
sudo systemctl status sales-dashboard
```

## Reverse Proxy Setup (Nginx)

### 1. Install Nginx

```bash
# Ubuntu/Debian
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

### 2. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/sales-dashboard
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Main application proxy
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://localhost:5000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/sales-dashboard /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## SSL Certificate (Optional but Recommended)

### Using Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

## Firewall Configuration

```bash
# Ubuntu/Debian (UFW)
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## Monitoring and Maintenance

### 1. View Application Logs

```bash
# PM2 logs
pm2 logs sales-dashboard

# Systemd logs
sudo journalctl -u sales-dashboard -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. Monitor System Resources

```bash
# Install htop
sudo apt install htop

# Monitor resources
htop

# Check disk usage
df -h

# Check memory usage
free -h
```

### 3. Backup Database

```bash
# Create backup script
nano /opt/sales-dashboard/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/sales_dashboard_$DATE.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump -U dashboard_user -h localhost sales_dashboard > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Remove backups older than 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

```bash
# Make script executable
chmod +x /opt/sales-dashboard/backup.sh

# Add to crontab for daily backups
crontab -e

# Add this line for daily backup at 2 AM:
0 2 * * * /opt/sales-dashboard/backup.sh
```

## Performance Optimization

### 1. Database Optimization

```sql
-- Connect to database
psql -U dashboard_user -d sales_dashboard -h localhost

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sales_agent_id ON sales(agent_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_agents_team_id ON agents(team_id);
CREATE INDEX IF NOT EXISTS idx_agents_active ON agents(is_active);
```

### 2. Application Optimization

```bash
# Install production dependencies only
npm ci --production

# Enable gzip compression in nginx (add to server block)
sudo nano /etc/nginx/sites-available/sales-dashboard
```

Add to nginx config:

```nginx
# Gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

## Troubleshooting

### Common Issues

1. **Application won't start**
   ```bash
   # Check logs
   pm2 logs sales-dashboard
   # or
   sudo journalctl -u sales-dashboard -f
   ```

2. **Database connection issues**
   ```bash
   # Test database connection
   psql -U dashboard_user -d sales_dashboard -h localhost
   
   # Check PostgreSQL status
   sudo systemctl status postgresql
   ```

3. **Port 5000 already in use**
   ```bash
   # Find process using port 5000
   sudo lsof -i :5000
   
   # Kill process if needed
   sudo kill -9 <PID>
   ```

4. **WebSocket connection issues**
   - Ensure nginx proxy configuration includes WebSocket support
   - Check firewall settings

### Health Check Script

```bash
# Create health check script
nano /opt/sales-dashboard/health-check.sh
```

```bash
#!/bin/bash
# Health check script

echo "=== Sales Dashboard Health Check ==="
echo "Time: $(date)"
echo

# Check application process
if pm2 list | grep -q "sales-dashboard.*online"; then
    echo "✓ Application is running"
else
    echo "✗ Application is not running"
    echo "Attempting to restart..."
    pm2 restart sales-dashboard
fi

# Check database connection
if pg_isready -U dashboard_user -h localhost -d sales_dashboard; then
    echo "✓ Database is accessible"
else
    echo "✗ Database connection failed"
fi

# Check web server response
if curl -s http://localhost:5000 > /dev/null; then
    echo "✓ Web server is responding"
else
    echo "✗ Web server is not responding"
fi

# Check disk space
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -lt 90 ]; then
    echo "✓ Disk usage is normal ($DISK_USAGE%)"
else
    echo "⚠ Disk usage is high ($DISK_USAGE%)"
fi

echo
echo "=== End Health Check ==="
```

```bash
chmod +x /opt/sales-dashboard/health-check.sh

# Run health check
./health-check.sh
```

## Access Your Application

After deployment:

- **Direct access**: `http://your-server-ip:5000`
- **With Nginx**: `http://your-domain.com`
- **Admin panel**: `http://your-domain.com/admin-portal`
- **Default credentials**: Username: `admin`, Password: `admin123`

## Security Recommendations

1. **Change default admin password immediately**
2. **Use strong database passwords**
3. **Enable firewall with minimal required ports**
4. **Regular security updates**
5. **SSL certificate for production**
6. **Regular database backups**
7. **Monitor application logs**

Your sales dashboard is now ready for production use on your Linux server!