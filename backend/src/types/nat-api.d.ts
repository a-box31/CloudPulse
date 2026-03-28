declare module "nat-api" {
  interface MapOptions {
    publicPort: number;
    privatePort: number;
    protocol: "TCP" | "UDP";
    ttl?: number;
  }

  interface UnmapOptions {
    publicPort: number;
    protocol: "TCP" | "UDP";
  }

  class NatAPI {
    map(options: MapOptions, callback: (err: Error | null) => void): void;
    unmap(options: UnmapOptions, callback: (err: Error | null) => void): void;
    externalIp(callback: (err: Error | null, ip: string) => void): void;
    destroy(): void;
  }

  export default NatAPI;
}
