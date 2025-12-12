
#!/bin/bash

# Sales Dashboard Installation Script
# This script sets up the application on a fresh Linux server

set -e

echo "=================================="
echo "Sales Dashboard Installation"
echo "=================================="
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root (use sudo)" 
   exit 1
fi

# Update system
echo "Updating system packages..."
apt-get update -qq

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# Install PostgreSQL if not installed
if ! command -v psql &> /dev/null; then
    echo "Installing PostgreSQL..."
    apt-get install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
fi

# Install PM2 globally
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Create application directory
APP_DIR="/opt/sales-dashboard"
echo "Creating application directory at $APP_DIR..."
mkdir -p $APP_DIR

# Set permissions
echo "Setting permissions..."
chown -R $SUDO_USER:$SUDO_USER $APP_DIR

# Copy application files (assuming script is run from app directory)
echo "Copying application files..."
cp -r . $APP_DIR/
cd $APP_DIR

# Install dependencies
echo "Installing application dependencies..."
sudo -u $SUDO_USER npm install

# Build application
echo "Building application..."
sudo -u $SUDO_USER npm run build

# Create database
echo "Setting up PostgreSQL database..."
sudo -u postgres psql -c "CREATE DATABASE sales_dashboard;" 2>/dev/null || echo "Database already exists"
sudo -u postgres psql -c "CREATE USER dashboard_user WITH PASSWORD 'changeme123';" 2>/dev/null || echo "User already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE sales_dashboard TO dashboard_user;" 2>/dev/null
sudo -u postgres psql -c "ALTER USER dashboard_user CREATEDB;" 2>/dev/null

# Configure PostgreSQL to allow local connections
echo "Configuring PostgreSQL..."
PG_HBA="/etc/postgresql/*/main/pg_hba.conf"
if ! grep -q "local.*sales_dashboard.*dashboard_user.*md5" $PG_HBA; then
    echo "local   sales_dashboard   dashboard_user                    md5" >> $PG_HBA
    systemctl restart postgresql
fi

# Create systemd service
echo "Creating systemd service..."
cat > /etc/systemd/system/sales-dashboard.service <<EOF
[Unit]
Description=Sales Dashboard Application
After=network.target postgresql.service

[Service]
Type=simple
User=$SUDO_USER
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=5000

[Install]
WantedBy=multi-user.target
EOF

# Configure firewall
if command -v ufw &> /dev/null; then
    echo "Configuring firewall..."
    ufw allow 5000/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
fi

# Enable and start service
echo "Starting application service..."
systemctl daemon-reload
systemctl enable sales-dashboard
systemctl start sales-dashboard

# Get server IP
SERVER_IP=$(hostname -I | awk '{print $1}')

echo ""
echo "=================================="
echo "Installation Complete!"
echo "=================================="
echo ""
echo "The application is now running on port 5000"
echo ""
echo "Next steps:"
echo "1. Open your browser and go to: http://$SERVER_IP:5000"
echo "2. You will be redirected to the setup wizard"
echo "3. Complete the setup with these database credentials:"
echo "   - Host: localhost"
echo "   - Port: 5432"
echo "   - Database: sales_dashboard"
echo "   - User: dashboard_user"
echo "   - Password: changeme123"
echo ""
echo "Service commands:"
echo "  - Check status: systemctl status sales-dashboard"
echo "  - View logs: journalctl -u sales-dashboard -f"
echo "  - Restart: systemctl restart sales-dashboard"
echo ""
echo "For production, configure Nginx as reverse proxy for SSL/domain support"
echo ""
