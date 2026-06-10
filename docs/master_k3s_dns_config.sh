#!/bin/bash
set -euo pipefail

echo "=== Starting K3s Master DNS & Networking Configuration ==="

# 1. Create the clean custom resolv file
RESOLV_FILE="/etc/k3s-resolv.conf"
echo "Creating custom DNS configuration at ${RESOLV_FILE}..."
cat << 'EOF' > "$RESOLV_FILE"
nameserver 172.16.0.5
nameserver 172.16.0.6
nameserver 10.66.0.6
EOF

chmod 644 "$RESOLV_FILE"

# 2. Modify the K3s Master Systemd service
SERVICE_FILE="/etc/systemd/system/k3s.service"
if [ ! -f "$SERVICE_FILE" ]; then
    echo "ERROR: K3s master service file not found at ${SERVICE_FILE}" >&2
    exit 1
fi

echo "Injecting flags into k3s.service..."

# Handle --resolv-conf flag
if grep -q "\--resolv-conf=" "$SERVICE_FILE"; then
    echo "Resolv flag already exists. Updating path..."
    sed -i 's|--resolv-conf=[^ ]*|--resolv-conf=/etc/k3s-resolv.conf|g' "$SERVICE_FILE"
else
    echo "Adding --resolv-conf flag to ExecStart..."
    sed -i 's|\(ExecStart=/usr/local/bin/k3s server\).*|\1 --resolv-conf=/etc/k3s-resolv.conf|' "$SERVICE_FILE"
fi

# Handle --flannel-backend flag
if grep -q "\--flannel-backend=" "$SERVICE_FILE"; then
    echo "Flannel backend flag already exists. Updating to host-gw..."
    sed -i 's|--flannel-backend=[^ ]*|--flannel-backend=host-gw|g' "$SERVICE_FILE"
else
    echo "Adding --flannel-backend=host-gw flag to ExecStart..."
    sed -i 's|\(ExecStart=/usr/local/bin/k3s server\).*|\1 --flannel-backend=host-gw|' "$SERVICE_FILE"
fi

# 3. Apply configurations and restart the Master engine
echo "Reloading systemd and restarting K3s Master..."
systemctl daemon-reload
systemctl restart k3s

echo "=== K3s Master Configuration Complete ==="
exit 0
