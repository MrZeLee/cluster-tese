# qBittorrent with PIA VPN

This module deploys qBittorrent with PIA VPN protection and automatic port forwarding.

## Features

- **VPN Protection**: All traffic routed through PIA VPN with kill switch
- **Automatic Port Forwarding**: PIA port forwarding with dynamic configuration
- **Shared Media Storage**: Uses the same media volume as Jellyfin
- **Password Management**: Automatic password setup and API configuration
- **Health Monitoring**: Comprehensive health checks for all components

## Prerequisites

1. **PIA VPN Account**: You need a Private Internet Access VPN subscription
2. **Sealed Secrets**: The cluster must have sealed-secrets operator installed
3. **Jellyfin Media Volume**: The `jellyfin-media` PVC must exist in the `media-server` namespace

## Setup

### 1. Configure Secrets

Create your secrets file:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: qbittorrent-secrets
  namespace: media-server
type: Opaque
stringData:
  pia-username: "your-pia-username"
  pia-password: "your-pia-password"
  qb-admin-password: "your-chosen-qbittorrent-admin-password"
```

Seal the secret:

```bash
kubeseal -f your-secret.yaml -w secrets/seal-secret-qbittorrent-secrets.yaml
```

### 2. Deploy

Fleet will automatically deploy both the secrets and the main application.

## Components

### Containers

1. **WireGuard VPN**: Establishes secure VPN connection to PIA
2. **Port Forwarder**: Manages PIA port forwarding and rebinding
3. **qBittorrent Config**: Configures qBittorrent with forwarded ports
4. **qBittorrent**: Main BitTorrent client

### Volumes

- **Config**: qBittorrent configuration (1Gi)
- **Media**: Shared with Jellyfin (downloads go here)
- **Shared Data**: Inter-container communication

### Health Checks

- **Startup Probes**: Handle slow initialization
- **Liveness Probes**: Restart unhealthy containers
- **Readiness Probes**: Remove from service when not ready

## Access

- **Web UI**: `https://qbittorrent.your-domain.com`
- **Username**: `admin`
- **Password**: The password you set in the secret

## How It Works

1. **VPN Setup**: WireGuard connects to PIA and establishes kill switch
2. **Port Forwarding**: Gets dynamic port from PIA (e.g., 54321)
3. **qBittorrent Config**: Updates qBittorrent to listen on the forwarded port
4. **Media Sharing**: Downloads go to `/downloads` which is the shared Jellyfin media volume

## Troubleshooting

Check container logs:

```bash
kubectl logs -n media-server deployment/qbittorrent -c wireguard
kubectl logs -n media-server deployment/qbittorrent -c port-forward
kubectl logs -n media-server deployment/qbittorrent -c qbittorrent-config
kubectl logs -n media-server deployment/qbittorrent -c qbittorrent
```

Check if VPN is connected:

```bash
kubectl exec -n media-server deployment/qbittorrent -c wireguard -- wg show
```

Check forwarded port:

```bash
kubectl exec -n media-server deployment/qbittorrent -c port-forward -- cat /shared/forwarded_port
```