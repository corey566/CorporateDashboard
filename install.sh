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

# Function to check if a port is available
check_port() {
    local port=$1
    if command -v netstat &> /dev/null; then
        netstat -tuln | grep -q ":$port " && return 1 || return 0
    elif command -v ss &> /dev/null; then
        ss -tuln | grep -q ":$port " && return 1 || return 0
    else
        (echo >/dev/tcp/localhost/$port) 2>/dev/null && return 1 || return 0
    fi
}

# Function to find an available port
find_available_port() {
    local ports=(5000 3000 8080 8000 4000 5001 5173 8081 9000)
    for port in "${ports[@]}"; do
        if check_port $port; then
            echo $port
            return 0
        fi
    done
    # Try random port in range 10000-20000
    for i in {1..20}; do
        local random_port=$((10000 + RANDOM % 10000))
        if check_port $random_port; then
            echo $random_port
            return 0
        fi
    done
    echo "5000"  # Fallback
}

# Update system
echo "Updating system packages..."
apt-get update -qq

# Install net-tools for port checking
apt-get install -y net-tools curl > /dev/null 2>&1 || true

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

# Generate secure password
DB_PASSWORD=$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9' | head -c 16)

# Create database and user
echo "Setting up PostgreSQL database..."
sudo -u postgres psql -c "DROP DATABASE IF EXISTS sales_dashboard;" 2>/dev/null || true
sudo -u postgres psql -c "DROP USER IF EXISTS dashboard_user;" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE sales_dashboard;"
sudo -u postgres psql -c "CREATE USER dashboard_user WITH PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE sales_dashboard TO dashboard_user;"
sudo -u postgres psql -c "ALTER USER dashboard_user CREATEDB;"
sudo -u postgres psql -d sales_dashboard -c "GRANT ALL ON SCHEMA public TO dashboard_user;"

# Configure PostgreSQL to allow local connections
echo "Configuring PostgreSQL access..."
PG_HBA=$(sudo -u postgres psql -t -P format=unaligned -c 'SHOW hba_file')
# Remove old entries and add new one
sudo sed -i '/dashboard_user/d' "$PG_HBA"
echo "local   sales_dashboard   dashboard_user                    md5" | sudo tee -a "$PG_HBA" > /dev/null
echo "host    sales_dashboard   dashboard_user    127.0.0.1/32    md5" | sudo tee -a "$PG_HBA" > /dev/null
systemctl restart postgresql

# Get current directory
APP_DIR=$(pwd)
echo "Application directory: $APP_DIR"

# Find available port
echo "Checking port availability..."
APP_PORT=$(find_available_port)
echo "Using port: $APP_PORT"

# Install dependencies
echo "Installing Node.js dependencies..."
npm install

# Create .env file with fresh configuration
echo "Creating configuration..."
SESSION_SECRET=$(openssl rand -base64 32)
cat > .env << EOF
NODE_ENV=production
PORT=$APP_PORT
DATABASE_URL=postgresql://dashboard_user:$DB_PASSWORD@localhost:5432/sales_dashboard
SESSION_SECRET=$SESSION_SECRET
PGHOST=localhost
PGPORT=5432
PGUSER=dashboard_user
PGPASSWORD=$DB_PASSWORD
PGDATABASE=sales_dashboard
EOF
chmod 600 .env

# Run database migrations/schema push
echo "Initializing database schema..."
npx drizzle-kit push --force 2>/dev/null || npm run db:push 2>/dev/null || echo "Schema will be created on first run"

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
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=$APP_PORT
EnvironmentFile=$APP_DIR/.env

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
echo "Starting application service..."
systemctl daemon-reload
systemctl enable sales-dashboard
systemctl stop sales-dashboard 2>/dev/null || true
systemctl start sales-dashboard

# Wait for service to start
sleep 5

# Get server IP
SERVER_IP=$(hostname -I | awk '{print $1}')

# Check service status
if systemctl is-active --quiet sales-dashboard; then
    echo ""
    echo "=================================="
    echo "Installation Complete!"
    echo "=================================="
    echo ""
    echo "✓ Application is running on port $APP_PORT"
    echo ""
    echo "Access your dashboard at:"
    echo "  http://$SERVER_IP:$APP_PORT"
    echo ""
    echo "You will be redirected to the setup wizard."
    echo "Use these default admin credentials after setup:"
    echo "  Username: admin"
    echo "  Password: (set during setup)"
    echo ""
    echo "Database credentials (auto-generated):"
    echo "  Host: localhost"
    echo "  Port: 5432"
    echo "  Database: sales_dashboard"
    echo "  User: dashboard_user"
    echo "  Password: $DB_PASSWORD"
    echo ""
    echo "Service commands:"
    echo "  - Check status: systemctl status sales-dashboard"
    echo "  - View logs: journalctl -u sales-dashboard -f"
    echo "  - Restart: systemctl restart sales-dashboard"
    echo "  - Stop: systemctl stop sales-dashboard"
    echo ""
else
    echo ""
    echo "⚠ Warning: Service failed to start"
    echo "Check logs with: journalctl -u sales-dashboard -xe"
    echo ""
    echo "Try starting manually:"
    echo "  cd $APP_DIR && node dist/index.js"
fi
