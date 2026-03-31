"use client";

import { useRef, useEffect, useState } from "react";
import { authFetch } from "@/lib/auth-fetch";
import type { SortField } from "./FileBrowser";

interface ToolbarProps {
  serverId: string;
  currentPath: string;
  selectionMode: boolean;
  selectedCount: number;
  sortField: SortField;
  sortReversed: boolean;
  onSortChange: (field: SortField) => void;
  onSortReversedChange: (reversed: boolean) => void;
  onToggleSelect: () => void;
  onSelectAll: () => void;
  onNewFolder: () => void;
  onDelete: () => void;
  onMove: () => void;
  onUploadComplete: () => void;
}

export function Toolbar({
  serverId,
  currentPath,
  selectionMode,
  selectedCount,
  sortField,
  sortReversed,
  onSortChange,
  onSortReversedChange,
  onToggleSelect,
  onSelectAll,
  onNewFolder,
  onDelete,
  onMove,
  onUploadComplete,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  // Set webkitdirectory attribute (not directly supported in React JSX types)
  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute("webkitdirectory", "");
      folderInputRef.current.setAttribute("directory", "");
    }
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setUploading(true);

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setUploadProgress(`${i + 1}/${fileList.length} — ${file.name}`);

        const formData = new FormData();
        formData.append("file", file);

        const res = await authFetch(
          `/api/files/${serverId}/upload?destPath=${encodeURIComponent(currentPath)}`,
          {
            method: "POST",
            body: formData,
          }
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Upload failed" }));
          alert(`Failed to upload ${file.name}: ${err.error}`);
          break;
        }
      }
    } finally {
      setUploading(false);
      setUploadProgress("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      onUploadComplete();
    }
  }

  async function handleFolderUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setUploading(true);

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const relativePath = (file as File & { webkitRelativePath: string }).webkitRelativePath;
        setUploadProgress(`${i + 1}/${fileList.length} — ${relativePath}`);

        const relativeDir = relativePath.substring(0, relativePath.lastIndexOf("/"));
        const destPath = currentPath.replace(/\/+$/, "") + "/" + relativeDir;

        const formData = new FormData();
        formData.append("file", file);

        const res = await authFetch(
          `/api/files/${serverId}/upload?destPath=${encodeURIComponent(destPath)}`,
          {
            method: "POST",
            body: formData,
          }
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Upload failed" }));
          alert(`Failed to upload ${file.name}: ${err.error}`);
          break;
        }
      }
    } finally {
      setUploading(false);
      setUploadProgress("");
      if (folderInputRef.current) folderInputRef.current.value = "";
      onUploadComplete();
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Always visible actions */}
      <button
        onClick={onNewFolder}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        New Folder
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        Upload
      </button>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleUpload}
        className="hidden"
      />

      <button
        onClick={() => folderInputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 3.75 3.75 0 013.572 4.845A4.5 4.5 0 0118.75 19.5H6.75z" />
        </svg>
        Upload Folder
      </button>
      <input
        ref={folderInputRef}
        type="file"
        onChange={handleFolderUpload}
        className="hidden"
      />

      {uploading && (
        <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-blue-400">
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Uploading {uploadProgress}</span>
        </div>
      )}

      <div className="w-px h-5 bg-gray-700" />

      {/* Sort controls */}
      <div className="flex items-center gap-1">
        {(["name", "date", "size"] as SortField[]).map((field) => (
          <button
            key={field}
            onClick={() => {
              if (sortField === field) {
                onSortReversedChange(!sortReversed);
              } else {
                onSortChange(field);
                onSortReversedChange(false);
              }
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
              sortField === field
                ? "bg-gray-700 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-gray-400"
            }`}
          >
            {field.charAt(0).toUpperCase() + field.slice(1)}
            {sortField === field && (
              <svg
                className={`w-3 h-3 transition-transform ${sortReversed ? "rotate-180" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
              </svg>
            )}
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-gray-700" />

      <button
        onClick={onToggleSelect}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${
          selectionMode
            ? "bg-blue-600 text-white"
            : "bg-gray-800 hover:bg-gray-700 text-gray-300"
        }`}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {selectionMode ? "Cancel" : "Select"}
      </button>

      {/* Selection mode actions */}
      {selectionMode && (
        <>
          <button
            onClick={onSelectAll}
            className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
          >
            Select All
          </button>

          {selectedCount > 0 && (
            <>
              <span className="text-xs text-gray-400">
                {selectedCount} selected
              </span>

              <button
                onClick={onMove}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
                </svg>
                Move
              </button>

              <button
                onClick={onDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Delete
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
