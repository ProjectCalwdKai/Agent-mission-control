#!/bin/bash
# =============================================================================
# OpenClaw Gateway VPS Setup Script
# =============================================================================
# Purpose: Install and configure OpenClaw Gateway on VPS for public access
# VPS IP: 168.231.113.95
# Port: 63624
# =============================================================================

set -e  # Exit on error

echo "🚀 OpenClaw Gateway VPS Setup"
echo "=============================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# =============================================================================
# Step 1: Check if Node.js is installed
# =============================================================================
echo "📦 Step 1: Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js not found. Installing...${NC}"
    
    # Detect package manager
    if command -v apt-get &> /dev/null; then
        # Debian/Ubuntu
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    elif command -v yum &> /dev/null; then
        # CentOS/RHEL
        curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
        yum install -y nodejs
    else
        echo -e "${RED}Unsupported package manager. Please install Node.js manually.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Node.js installed:$(node --version)${NC}"
fi

# =============================================================================
# Step 2: Check if npm is installed
# =============================================================================
echo ""
echo "📦 Step 2: Checking npm..."
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm not found. Please install npm first.${NC}"
    exit 1
else
    echo -e "${GREEN}✓ npm installed:$(npm --version)${NC}"
fi

# =============================================================================
# Step 3: Install OpenClaw globally
# =============================================================================
echo ""
echo "📦 Step 3: Installing OpenClaw..."
if command -v openclaw &> /dev/null; then
    echo -e "${GREEN}✓ OpenClaw already installed:$(openclaw --version)${NC}"
    echo "Updating to latest version..."
    npm install -g openclaw
else
    npm install -g openclaw
fi

echo -e "${GREEN}✓ OpenClaw installed successfully${NC}"

# =============================================================================
# Step 4: Stop any existing Gateway instance
# =============================================================================
echo ""
echo "🛑 Step 4: Stopping existing Gateway instances..."
pkill -f "openclaw gateway" 2>/dev/null && echo "Stopped existing Gateway" || echo "No existing Gateway running"

# =============================================================================
# Step 5: Check firewall status
# =============================================================================
echo ""
echo "🔥 Step 5: Configuring firewall..."

if command -v ufw &> /dev/null; then
    echo "UFW firewall detected..."
    
    # Check if active
    if ufw status | grep -q "Status: active"; then
        echo "Firewall is active. Opening port 63624..."
        ufw allow 63624/tcp
        echo -e "${GREEN}✓ Port 63624 opened${NC}"
    else
        echo "Firewall is inactive. Skipping port configuration."
    fi
else
    echo -e "${YELLOW}UFW not found. If you use a different firewall, please open port 63624/tcp manually.${NC}"
fi

# Check iptools
if command -v firewall-cmd &> /dev/null; then
    echo "firewalld detected..."
    firewall-cmd --permanent --add-port=63624/tcp
    firewall-cmd --reload
    echo -e "${GREEN}✓ Port 63624 opened in firewalld${NC}"
fi

# =============================================================================
# Step 6: Verify port 63624 is available
# =============================================================================
echo ""
echo "🔍 Step 6: Checking if port 63624 is available..."
if netstat -tlnp 2>/dev/null | grep -q ":63624" || ss -tlnp 2>/dev/null | grep -q ":63624"; then
    echo -e "${RED}Port 63624 is already in use!${NC}"
    echo "Please stop the service using this port or choose a different port."
    exit 1
else
    echo -e "${GREEN}✓ Port 63624 is available${NC}"
fi

# =============================================================================
# Step 7: Start Gateway with public binding
# =============================================================================
echo ""
echo "🚀 Step 7: Starting OpenClaw Gateway..."
echo "Binding to: 0.0.0.0:63624 (all interfaces, including public IP)"
echo ""

# Start Gateway in background
nohup openclaw gateway start --bind 0.0.0.0 --port 63624 > /var/log/openclaw-gateway.log 2>&1 &
GATEWAY_PID=$!

sleep 3  # Wait for startup

# Check if process is running
if ps -p $GATEWAY_PID > /dev/null; then
    echo -e "${GREEN}✓ Gateway started successfully (PID: $GATEWAY_PID)${NC}"
else
    echo -e "${RED}✗ Gateway failed to start. Check logs:${NC}"
    cat /var/log/openclaw-gateway.log
    exit 1
fi

# =============================================================================
# Step 8: Verify Gateway is listening correctly
# =============================================================================
echo ""
echo "🔍 Step 8: Verifying Gateway binding..."
sleep 2

if netstat -tlnp 2>/dev/null | grep -q "0.0.0.0:63624" || ss -tlnp 2>/dev/null | grep -q "0.0.0.0:63624"; then
    echo -e "${GREEN}✓ Gateway is bound to 0.0.0.0:63624 (public access enabled)${NC}"
else
    echo -e "${YELLOW}⚠ Gateway might be bound to localhost only. Checking...${NC}"
    netstat -tlnp 2>/dev/null | grep 63624 || ss -tlnp 2>/dev/null | grep 63624
fi

# =============================================================================
# Step 9: Test local connectivity
# =============================================================================
echo ""
echo "🧪 Step 9: Testing local connectivity..."
if curl -s --connect-timeout 5 http://localhost:63624 > /dev/null; then
    echo -e "${GREEN}✓ Gateway responds to local requests${NC}"
else
    echo -e "${YELLOW}⚠ Gateway not responding locally. May still work externally.${NC}"
fi

# =============================================================================
# Step 10: Display setup summary
# =============================================================================
echo ""
echo "=================================================="
echo -e "${GREEN}✅ OpenClaw Gateway Setup Complete!${NC}"
echo "=================================================="
echo ""
echo "📡 Gateway Configuration:"
echo "   - Binding: 0.0.0.0:63624"
echo "   - Public URL: http://$VPS_IP:63624"
echo "   - PID: $GATEWAY_PID"
echo "   - Logs: /var/log/openclaw-gateway.log"
echo ""
echo "🌐 Next Steps:"
echo "   1. Test from your laptop:"
echo "      curl http://168.231.113.95:63624"
echo ""
echo "   2. Update Vercel environment variable:"
echo "      OPENCLAW_URL=http://168.231.113.95:63624"
echo ""
echo "   3. Vercel will auto-redeploy"
echo ""
echo "🔧 Management Commands:"
echo "   - View logs: tail -f /var/log/openclaw-gateway.log"
echo "   - Stop: kill $GATEWAY_PID"
echo "   - Restart: Run this script again"
echo ""
echo "📊 Check status:"
echo "   netstat -tlnp | grep 63624"
echo "   curl http://localhost:63624"
echo ""
echo "=================================================="

# =============================================================================
# Optional: Create systemd service for auto-start
# =============================================================================
echo ""
read -p "🔧 Create systemd service for auto-start on boot? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Creating systemd service..."
    
    cat > /etc/systemd/system/openclaw-gateway.service << 'EOF'
[Unit]
Description=OpenClaw Gateway
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/openclaw gateway start --bind 0.0.0.0 --port 63624
Restart=always
RestartSec=10
User=root
Environment=NODE_ENV=production
WorkingDirectory=/root

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=openclaw-gateway

[Install]
WantedBy=multi-user.target
EOF

    # Reload systemd
    systemctl daemon-reload
    
    # Stop the background process
    kill $GATEWAY_PID 2>/dev/null || true
    
    # Enable and start service
    systemctl enable openclaw-gateway
    systemctl start openclaw-gateway
    
    # Check status
    sleep 2
    if systemctl is-active --quiet openclaw-gateway; then
        echo -e "${GREEN}✓ Systemd service created and started${NC}"
        echo "   - Service: openclaw-gateway"
        echo "   - Auto-start: Enabled"
        echo "   - View logs: journalctl -u openclaw-gateway -f"
        echo "   - Status: systemctl status openclaw-gateway"
    else
        echo -e "${RED}✗ Systemd service failed to start${NC}"
        echo "Check logs: journalctl -u openclaw-gateway"
    fi
fi

echo ""
echo "🎉 Setup complete!"
