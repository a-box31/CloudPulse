export interface FileInfo {
  name: string;
  path: string;
  isDirectory: boolean;
  mimeType: string | null;
  sizeBytes: number;
  modifiedAt: string;
}

export interface ServerInfo {
  id: string;
  name: string;
  publicUrl: string | null;
  lastSeen: string | null;
  isOnline: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
}
