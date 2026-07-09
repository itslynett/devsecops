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
flux bootstrap github --owner=mistiusiu --repository=usiu-k8s-data-science --private=false --personal=true --path=clusters/big-data --token-auth --timeout=15m0s
```

Validate that the bootstrap was successful.

```bash
flux check
```

Upgrade the Talos Linux cluster to be compatible with Longhorn.

```bash
talosctl -n <NODE_IP> upgrade --image factory.talos.dev/metal-installer/613e1592b2da41ae5e265e8789429f22e121aab91cb4deb6bc3c0b6262961245:v1.13.5 --talosconfig=./talosconfig
```

## Infisical Authentication

Set up the `infisical-machine-identity-credentials` secret on `big-data` cluster.

```bash
export CLIENT_ID=<client_id>
export CLIENT_SECRET=<client_secret>
export NAMESPACE=<namespace>
```

```bash
kubectl create namespace $NAMESPACE
```

```bash
kubectl create secret generic infisical-machine-identity-credentials --namespace=$NAMESPACE --from-literal=clientId=$CLIENT_ID --from-literal=clientSecret=$CLIENT_SECRET
```
