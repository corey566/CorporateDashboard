
# Sales Dashboard - Installation Guide

## Quick Installation on Linux Server

This guide will help you deploy the Sales Dashboard on a fresh Linux server with automatic PostgreSQL setup.

### Prerequisites

- Ubuntu 20.04+ or Debian 11+ server
- Root or sudo access
- Minimum 2GB RAM
- 10GB free disk space

### One-Command Installation

```bash
curl -fsSL https://raw.githubusercontent.com/yourusername/sales-dashboard/main/install.sh | sudo bash
```

Or manually:

```bash
# Download the application
git clone https://github.com/yourusername/sales-dashboard.git
cd sales-dashboard

# Run installation script
sudo chmod +x install.sh
sudo ./install.sh
```

### What the Installer Does

1. **Installs Dependencies**
   - Node.js 20+
   - PostgreSQL 14+
   - PM2 process manager

2. **Sets Up Database**
   - Creates `sales_dashboard` database
   - Creates `dashboard_user` with password
   - Configures PostgreSQL access

3. **Configures Application**
   - Installs npm packages
   - Builds the application
   - Creates systemd service
   - Configures firewall

4. **Starts Service**
   - Application runs on port 5000
   - Auto-restart on failure
   - Starts on server boot

### Post-Installation Setup

1. **Access Setup Wizard**
   ```
   http://YOUR_SERVER_IP:5000
   ```

2. **Complete Setup Form**
   
   **Step 1: Database Configuration**
   - Host: `localhost`
   - Port: `5432`
   - Database: `sales_dashboard`
   - User: `dashboard_user`
   - Password: `changeme123` (or custom if you modified)

   **Step 2: Admin Account**
   - Choose admin username
   - Set strong password (min 6 characters)
   - Configure application port (default: 5000)
   - Optional: Set domain name

3. **Setup Completes**
   - Application automatically initializes database
   - Creates all required tables
   - Creates admin user
   - Restarts with new configuration

### Domain Setup (Optional)

To use a domain name instead of IP:

1. **Install Nginx**
   ```bash
   sudo apt install nginx
   ```

2. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/sales-dashboard
   ```

   Add:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Enable Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/sales-dashboard /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. **SSL Certificate (Recommended)**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

### Service Management

```bash
# Check status
sudo systemctl status sales-dashboard

# View logs
sudo journalctl -u sales-dashboard -f

# Restart
sudo systemctl restart sales-dashboard

# Stop
sudo systemctl stop sales-dashboard

# Start
sudo systemctl start sales-dashboard
```

### Troubleshooting

**Application won't start**
```bash
# Check logs
sudo journalctl -u sales-dashboard -n 50

# Check if port is in use
sudo lsof -i :5000

# Restart PostgreSQL
sudo systemctl restart postgresql
```

**Can't access setup page**
```bash
# Check firewall
sudo ufw status

# Allow port
sudo ufw allow 5000/tcp

# Check service
sudo systemctl status sales-dashboard
```

**Database connection errors**
```bash
# Test PostgreSQL connection
sudo -u postgres psql -d sales_dashboard -U dashboard_user

# Check pg_hba.conf
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

### Security Recommendations

1. Change default database password
2. Use strong admin password
3. Enable firewall
4. Set up SSL certificate
5. Regular backups
6. Keep system updated

### Backup

```bash
# Backup database
sudo -u postgres pg_dump sales_dashboard > backup.sql

# Restore database
sudo -u postgres psql sales_dashboard < backup.sql
```

### Updating

```bash
cd /opt/sales-dashboard
sudo git pull
sudo npm install
sudo npm run build
sudo systemctl restart sales-dashboard
```

For more detailed deployment options, see:
- [Linux Deployment Guide](LINUX_DEPLOYMENT.md)
- [Plesk Deployment Guide](PLESK_DEPLOYMENT.md)
