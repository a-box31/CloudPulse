export interface FileInfo {
  name: string;
  path: string;
  isDirectory: boolean;
  mimeType: string | null;
  sizeBytes: number;
  modifiedAt: string;
}

export interface ServerHeartbeat {
  publicUrl: string;
  lanUrl: string | null;
}

export interface SystemInfo {
  hostname: string;
  platform: string;
  arch: string;
  uptime: number;
  totalMemory: number;
  freeMemory: number;
  disk: {
    total: number;
    free: number;
    available: number;
  };
}
