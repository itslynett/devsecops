#!/bin/bash
set -euo pipefail

# 1. Enforce the clean custom resolv file
RESOLV_FILE="/etc/k3s-resolv.conf"
cat << 'EOF' > "$RESOLV_FILE"
nameserver 172.16.0.5
nameserver 172.16.0.6
nameserver 10.66.0.6
EOF
chmod 644 "$RESOLV_FILE"

# 2. Force K3s Agent to listen on host-gw routing profiles
SERVICE_FILE="/etc/systemd/system/k3s-agent.service"
if [ -f "$SERVICE_FILE" ]; then
    # Clear out any prior iterations of the resolv flag to prevent duplication
    sed -i 's| --resolv-conf=[^ ]*||g' "$SERVICE_FILE"
    
    # Inject the streamlined parameters safely
    sed -i 's|\(ExecStart=/usr/local/bin/k3s agent\).*|\1 --resolv-conf=/etc/k3s-resolv.conf|' "$SERVICE_FILE"
fi

# 3. Recycle configurations and restart the Agent subsystem
systemctl daemon-reload
systemctl restart k3s-agent
exit 0
