
#!/bin/bash

echo "==================================="
echo "Restarting Sales Dashboard"
echo "==================================="

# Stop systemd service
echo "Stopping systemd service..."
sudo systemctl stop sales-dashboard 2>/dev/null || true

# Kill any processes on port 5000
echo "Checking for processes on port 5000..."
PIDS=$(sudo lsof -ti:5000 2>/dev/null)
if [ ! -z "$PIDS" ]; then
    echo "Killing processes on port 5000: $PIDS"
    sudo kill -9 $PIDS 2>/dev/null || true
    sleep 2
fi

# Kill any processes on port 3000
echo "Checking for processes on port 3000..."
PIDS=$(sudo lsof -ti:3000 2>/dev/null)
if [ ! -z "$PIDS" ]; then
    echo "Killing processes on port 3000: $PIDS"
    sudo kill -9 $PIDS 2>/dev/null || true
    sleep 2
fi

# Kill any node processes related to this app
echo "Cleaning up any remaining node processes..."
sudo pkill -f "CorporateDashboard" 2>/dev/null || true
sleep 2

# Rebuild the application
echo "Rebuilding application..."
npm run build

# Restart systemd service
echo "Starting systemd service..."
sudo systemctl daemon-reload
sudo systemctl start sales-dashboard

# Wait a moment
sleep 3

# Check status
echo ""
echo "==================================="
sudo systemctl status sales-dashboard --no-pager
echo "==================================="
echo ""
echo "To view logs, run: sudo journalctl -u sales-dashboard -f"
