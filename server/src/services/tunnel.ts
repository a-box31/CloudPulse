import os from "os";
import { config } from "../config.js";

let renewalTimer: ReturnType<typeof setInterval> | null = null;
let natClient: any = null;

/**
 * Detect the best LAN IPv4 address.
 * Prefers real LAN interfaces (192.168.x / 10.x) over virtual bridges (172.x).
 */
export function getLanUrl(port: number): string | null {
  const interfaces = os.networkInterfaces();
  let fallback: string | null = null;

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]!) {
      if (iface.internal || iface.family !== "IPv4") continue;

      const ip = iface.address;

      // Prefer 192.168.x.x or 10.x.x.x — these are almost always real LAN
      if (ip.startsWith("192.168.") || ip.startsWith("10.")) {
        return `http://${ip}:${port}`;
      }

      // 172.16-31.x.x could be LAN but is often Docker/virtual — keep as fallback
      if (!fallback) {
        fallback = `http://${ip}:${port}`;
      }
    }
  }

  return fallback;
}

/**
 * Establish a public connection for the backend server.
 * Tries UPnP/NAT-PMP first, falls back to manual IP detection.
 */
export async function establishConnection(port: number): Promise<string> {
  // 1. Try UPnP / NAT-PMP
  try {
    const publicUrl = await tryUpnp(port);
    startLeaseRenewal(port);
    console.log(`[tunnel] UPnP port mapping established: ${publicUrl}`);
    return publicUrl;
  } catch (err) {
    console.log(
      `[tunnel] UPnP failed: ${err instanceof Error ? err.message : err}`
    );
  }

  // 2. Fall back to public IP detection (manual port forward assumed)
  try {
    const publicIp = await getPublicIp();
    const publicUrl = `http://${publicIp}:${port}`;
    console.log(
      `[tunnel] Using public IP (manual port forward required): ${publicUrl}`
    );
    return publicUrl;
  } catch {
    console.log("[tunnel] Could not detect public IP");
  }

  // 3. Last resort: LAN IP (only reachable on the local network)
  const lanUrl = getLanUrl(port);
  if (lanUrl) {
    console.log(`[tunnel] No public route available, using LAN: ${lanUrl}`);
    return lanUrl;
  }

  console.log("[tunnel] No network route available");
  return `http://localhost:${port}`;
}

/**
 * Try to create a UPnP/NAT-PMP port mapping via nat-api.
 */
async function tryUpnp(port: number): Promise<string> {
  const NatAPI = (await import("nat-api")).default;
  natClient = new NatAPI();

  return new Promise((resolve, reject) => {
    natClient.map(
      {
        publicPort: port,
        privatePort: port,
        protocol: "TCP",
        ttl: config.upnpLeaseTtl,
      },
      (err: Error | null) => {
        if (err) {
          reject(err);
          return;
        }

        // Get external IP
        natClient.externalIp((ipErr: Error | null, ip: string) => {
          if (ipErr) {
            reject(ipErr);
            return;
          }
          resolve(`http://${ip}:${port}`);
        });
      }
    );
  });
}

/**
 * Periodically refresh the UPnP lease to keep the port mapping alive.
 */
function startLeaseRenewal(port: number): void {
  if (renewalTimer) clearInterval(renewalTimer);

  renewalTimer = setInterval(async () => {
    try {
      await tryUpnp(port);
      console.log("[tunnel] UPnP lease renewed");
    } catch (err) {
      console.error(
        `[tunnel] UPnP lease renewal failed: ${err instanceof Error ? err.message : err}`
      );
    }
  }, config.upnpRenewInterval);
}

/**
 * Detect public IP using an external service.
 */
async function getPublicIp(): Promise<string> {
  const response = await fetch("https://api.ipify.org?format=json");
  const data = (await response.json()) as { ip: string };
  return data.ip;
}

/**
 * Clean up port mappings on shutdown.
 */
export async function cleanup(port: number): Promise<void> {
  if (renewalTimer) {
    clearInterval(renewalTimer);
    renewalTimer = null;
  }

  if (natClient) {
    return new Promise((resolve) => {
      natClient.unmap(
        { publicPort: port, protocol: "TCP" },
        (err: Error | null) => {
          if (err) {
            console.error(`[tunnel] Failed to remove port mapping: ${err.message}`);
          } else {
            console.log("[tunnel] UPnP port mapping removed");
          }
          natClient.destroy();
          natClient = null;
          resolve();
        }
      );
    });
  }
}
