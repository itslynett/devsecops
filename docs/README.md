# USIU K3s Cluster

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
flux bootstrap github --owner=mistiusiu --repository=usiu-k8s-data-science --private=false --personal=true --path=clusters/testing
```

Validate that the bootstrap was successful.

```bash
flux check
```

## Networking

The `host-gw` backend will be used. Run the respective scripts on the master and agent nodes to configure this.



