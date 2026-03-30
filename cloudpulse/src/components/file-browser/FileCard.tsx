"use client";

import { FileIcon } from "./FileIcon";
import type { FileInfo } from "@/types";

interface FileCardProps {
  file: FileInfo;
  serverId: string;
  selectionMode?: boolean;
  selected?: boolean;
  onClick: () => void;
  onSelect?: () => void;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function FileCard({
  file,
  selectionMode,
  selected,
  onClick,
  onSelect,
}: FileCardProps) {
  const iconColor = file.isDirectory
    ? "text-blue-400"
    : file.mimeType?.startsWith("image/")
      ? "text-green-400"
      : file.mimeType?.startsWith("video/")
        ? "text-purple-400"
        : file.mimeType?.startsWith("audio/")
          ? "text-orange-400"
          : "text-gray-400";

  function handleClick() {
    if (selectionMode && onSelect) {
      onSelect();
    } else {
      onClick();
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left group ${
        selected
          ? "bg-blue-600/15 border border-blue-500/30"
          : "hover:bg-gray-800/50 border border-transparent"
      }`}
    >
      {selectionMode && (
        <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
            selected
              ? "bg-blue-600 border-blue-600"
              : "border-gray-600 group-hover:border-gray-400"
          }`}
        >
          {selected && (
            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          )}
        </div>
      )}
      <div className={iconColor}>
        <FileIcon
          mimeType={file.mimeType}
          isDirectory={file.isDirectory}
          className="w-8 h-8"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-200 truncate">
          {file.name}
        </p>
        <p className="text-xs text-gray-500">
          {file.isDirectory ? "Folder" : formatSize(file.sizeBytes)}
          {" \u00B7 "}
          {formatDate(file.modifiedAt)}
        </p>
      </div>
    </button>
  );
}
