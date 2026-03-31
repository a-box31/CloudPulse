# CloudPulse Server

Turn any machine into a personal cloud storage server. Access your files from anywhere through a secure web interface — no subscriptions, no third-party storage.

## What It Does

CloudPulse Server runs on your home machine and exposes your local files over the internet. It handles NAT traversal automatically via UPnP, so in most cases you don't need to manually configure port forwarding.

### File Operations
- Browse directories, upload, download, move, rename, and delete
- Stream video and audio with full seeking support (HTTP Range requests)
- Hidden files are filtered out automatically

### Networking
- Automatic UPnP/NAT-PMP port mapping on compatible routers
- LAN IP and public IP detection
- Periodic heartbeats to keep your server discoverable
- Falls back gracefully to LAN-only if UPnP is unavailable

### Security
- API key authentication for all endpoints
- JWT token validation
- Directory traversal protection

## Quick Start

```yaml
services:
  cloudpulse-server:
    image: abox31/cloudpulse:0.1.0
    network_mode: host
    restart: unless-stopped
    environment:
      - CLOUD_URL=https://your-frontend-url.com
      - SERVER_ID=your-server-id
      - API_KEY=your-api-key
      - ROOT_DIR=/data
      - PORT=4000
    volumes:
      - /path/to/your/files:/data
```

> **Note:** `network_mode: host` is required for UPnP port mapping to work.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CLOUD_URL` | Yes | URL of your CloudPulse frontend instance |
| `SERVER_ID` | Yes | Server ID from the frontend dashboard |
| `API_KEY` | Yes | API key for frontend authentication |
| `ROOT_DIR` | No | Directory to serve files from (default: `/data`) |
| `PORT` | No | Listening port (default: `4000`) |

## Volumes

| Container Path | Description |
|----------------|-------------|
| `/data` | Mount your host directory here to make files accessible |

## How It Works

This image is the **backend** half of CloudPulse. It serves files from your machine and registers itself with a separately hosted [CloudPulse frontend](https://github.com/a-box31/PersonalCloud-). You'll need a running frontend instance to manage accounts, discover servers, and browse files through the web UI.

## Image Details

- **Base:** Node.js 22 Alpine (multi-stage build)
- **Exposed Port:** 4000
- **Architecture:** linux/amd64

## Source

[GitHub](https://github.com/a-box31/PersonalCloud-)
License: MIT
