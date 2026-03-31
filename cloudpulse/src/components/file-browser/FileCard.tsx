"use client";

import { useState, useRef, useEffect } from "react";
import { FileIcon } from "./FileIcon";
import type { FileInfo } from "@/types";

interface FileCardProps {
  file: FileInfo;
  serverId: string;
  selectionMode?: boolean;
  selected?: boolean;
  onClick: () => void;
  onSelect?: () => void;
  onRename?: (file: FileInfo, newName: string) => void;
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
  onRename,
}: FileCardProps) {
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming && inputRef.current) {
      inputRef.current.focus();
      const dotIndex = file.name.lastIndexOf(".");
      if (!file.isDirectory && dotIndex > 0) {
        inputRef.current.setSelectionRange(0, dotIndex);
      } else {
        inputRef.current.select();
      }
    }
  }, [renaming, file.name, file.isDirectory]);

  function commitRename() {
    const trimmed = newName.trim();
    if (trimmed && trimmed !== file.name && onRename) {
      onRename(file, trimmed);
    }
    setRenaming(false);
    setNewName(file.name);
  }

  const iconColor = file.isDirectory
    ? "text-blue-400"
    : file.mimeType?.startsWith("image/")
      ? "text-green-400"
      : file.mimeType?.startsWith("video/")
        ? "text-purple-400"
        : file.mimeType?.startsWith("audio/")
          ? "text-orange-400"
          : "text-gray-400";

  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleClick() {
    if (selectionMode && onSelect) {
      onSelect();
      return;
    }
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      // Double click
      if (onRename) {
        setNewName(file.name);
        setRenaming(true);
      }
    } else {
      clickTimer.current = setTimeout(() => {
        clickTimer.current = null;
        onClick();
      }, 250);
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
        {renaming ? (
          <input
            ref={inputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") {
                setRenaming(false);
                setNewName(file.name);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            className="w-full text-sm font-medium text-gray-200 bg-gray-800 border border-blue-500 rounded px-2 py-0.5 outline-none"
          />
        ) : (
          <p className="text-sm font-medium text-gray-200 truncate">
            {file.name}
          </p>
        )}
        <p className="text-xs text-gray-500">
          {file.isDirectory ? "Folder" : formatSize(file.sizeBytes)}
          {" \u00B7 "}
          {formatDate(file.modifiedAt)}
        </p>
      </div>
    </button>
  );
}
