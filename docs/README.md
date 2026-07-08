# USIU Talos Linux Cluster

## Setup FluxCD

Check that the K3s cluster is compatible with FluxCD.

```bash
flux check --pre
```

If so, set the GitHub PAT with the Administration and Content read and write permissions.

```bash
export GITHUB_TOKEN=token_path3r3
```

Proceed to bootstrap the installation.

```bash
flux bootstrap github --owner=mistiusiu --repository=usiu-k8s-data-science --private=false --personal=true --path=clusters/hadoop --token-auth --timeout=15m0s
```

Validate that the bootstrap was successful.

```bash
flux check
```

Upgrade the Talos Linux cluster to be compatible with Longhorn.

```bash
talosctl -n <NODE_IP> upgrade --image factory.talos.dev/metal-installer/613e1592b2da41ae5e265e8789429f22e121aab91cb4deb6bc3c0b6262961245:v1.13.5 --talosconfig=./talosconfig
```

## K3s Networking

The `host-gw` (Host Gateway) backend will be used. Run the respective scripts on the master and agent nodes to configure this.

The default VXLAN backend used by K3s is automatically blocked on strict networks (like an institution's one). This is due to the fact that it uses unencrypted UDP packets to interface between the master and the agent nodes. Such networking is blocked by default (given the strict security posture adopted by the institution's firewall) since it looks like a brute force attempt to penentrate into the network.

Host Gateway works by writing direct route rule into Linux. For example, _"To talk to Pod Subnet 10.42.2.0, send standard packets directly to the Ethernet IP of Leaf Node B"_. Hence, the traffic appears as standard, normal computer-to-computer communication allowing the packets to pass through smoothly enabling intranet and internet access.
