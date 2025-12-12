
#!/bin/bash

# Update systemd service file for production
sudo tee /etc/systemd/system/sales-dashboard.service > /dev/null << 'EOF'
[Unit]
Description=Sales Dashboard Application
After=network.target postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/CorporateDashboard
ExecStart=/usr/bin/node /opt/CorporateDashboard/dist/index.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=5000
Environment=NODE_TLS_REJECT_UNAUTHORIZED=0
EnvironmentFile=/opt/CorporateDashboard/.env

[Install]
WantedBy=multi-user.target
EOF

echo "Systemd service file updated"
sudo systemctl daemon-reload
echo "Systemd daemon reloaded"
