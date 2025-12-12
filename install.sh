
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
    echo "Installing Node.js 20..."
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

# Create database and user
echo "Setting up PostgreSQL database..."
sudo -u postgres psql -c "CREATE DATABASE sales_dashboard;" 2>/dev/null || echo "Database already exists"
sudo -u postgres psql -c "CREATE USER dashboard_user WITH PASSWORD 'changeme123';" 2>/dev/null || echo "User already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE sales_dashboard TO dashboard_user;"
sudo -u postgres psql -c "ALTER USER dashboard_user CREATEDB;"

# Configure PostgreSQL to allow local connections
echo "Configuring PostgreSQL access..."
PG_HBA=$(sudo -u postgres psql -t -P format=unaligned -c 'SHOW hba_file')
if ! grep -q "sales_dashboard.*dashboard_user.*md5" "$PG_HBA"; then
    echo "local   sales_dashboard   dashboard_user                    md5" | sudo tee -a "$PG_HBA"
    systemctl restart postgresql
fi

# Get current directory (should be /opt/sales-dashboard)
APP_DIR=$(pwd)
echo "Application directory: $APP_DIR"

# Install dependencies
echo "Installing Node.js dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
NODE_ENV=production
DATABASE_URL=postgresql://dashboard_user:changeme123@localhost:5432/sales_dashboard
SESSION_SECRET=$(openssl rand -base64 32)
PGHOST=localhost
PGPORT=5432
PGUSER=dashboard_user
PGPASSWORD=changeme123
PGDATABASE=sales_dashboard
EOF
    chmod 600 .env
fi

# Build the application
echo "Building application..."
npm run build

# Create systemd service
echo "Creating systemd service..."
cat > /etc/systemd/system/sales-dashboard.service << EOF
[Unit]
Description=Sales Dashboard Application
After=network.target postgresql.service

[Service]
Type=simple
User=$SUDO_USER
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/npm run dev
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
echo "Starting application service..."
systemctl daemon-reload
systemctl enable sales-dashboard
systemctl start sales-dashboard

# Wait a moment for service to start
sleep 3

# Get server IP
SERVER_IP=$(hostname -I | awk '{print $1}')

# Check service status
if systemctl is-active --quiet sales-dashboard; then
    echo ""
    echo "=================================="
    echo "Installation Complete!"
    echo "=================================="
    echo ""
    echo "✓ Application is running on port 5000"
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
    echo "  - Stop: systemctl stop sales-dashboard"
    echo ""
    echo "For production with custom domain and SSL, configure Nginx:"
    echo "  See LINUX_DEPLOYMENT.md for detailed Nginx setup"
    echo ""
else
    echo ""
    echo "⚠ Warning: Service failed to start"
    echo "Check logs with: journalctl -u sales-dashboard -xe"
fi
