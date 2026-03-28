"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FileCard } from "./FileCard";
import { FolderBreadcrumb } from "./FolderBreadcrumb";
import { FilePreview } from "./FilePreview";
import { Toolbar } from "./Toolbar";
import { CreateFolderDialog } from "./CreateFolderDialog";
import { MoveDialog } from "./MoveDialog";
import type { FileInfo } from "@/types";

interface FileBrowserProps {
  serverId: string;
  currentPath: string;
}

export function FileBrowser({ serverId, currentPath }: FileBrowserProps) {
  const router = useRouter();
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Preview
  const [previewFile, setPreviewFile] = useState<FileInfo | null>(null);

  // Selection
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  // Dialogs
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `/api/files/${serverId}?path=${encodeURIComponent(currentPath)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to load files");
        return;
      }

      const data = await res.json();
      setFiles(data.files || []);
    } catch {
      setError("Network error. Is the server running?");
    } finally {
      setLoading(false);
    }
  }, [serverId, currentPath]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Clear selection when changing directory
  useEffect(() => {
    setSelectedFiles(new Set());
    setSelectionMode(false);
  }, [currentPath]);

  function handleFileClick(file: FileInfo) {
    if (file.isDirectory) {
      router.push(`/dashboard/${serverId}${file.path}`);
    } else {
      setPreviewFile(file);
    }
  }

  function toggleSelection(filePath: string) {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(filePath)) {
        next.delete(filePath);
      } else {
        next.add(filePath);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map((f) => f.path)));
    }
  }

  function handleToggleSelectionMode() {
    if (selectionMode) {
      setSelectionMode(false);
      setSelectedFiles(new Set());
    } else {
      setSelectionMode(true);
    }
  }

  async function handleDelete() {
    if (selectedFiles.size === 0) return;

    const count = selectedFiles.size;
    if (!confirm(`Delete ${count} item${count > 1 ? "s" : ""}? This cannot be undone.`)) {
      return;
    }

    const token = localStorage.getItem("accessToken");

    for (const filePath of selectedFiles) {
      await fetch(`/api/files/${serverId}/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ path: filePath }),
      });
    }

    setSelectedFiles(new Set());
    setSelectionMode(false);
    fetchFiles();
  }

  function handleRefresh() {
    fetchFiles();
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4">
        <Toolbar
          serverId={serverId}
          currentPath={currentPath}
          selectionMode={selectionMode}
          selectedCount={selectedFiles.size}
          onToggleSelect={handleToggleSelectionMode}
          onSelectAll={toggleSelectAll}
          onNewFolder={() => setShowCreateFolder(true)}
          onDelete={handleDelete}
          onMove={() => setShowMoveDialog(true)}
          onUploadComplete={handleRefresh}
        />
      </div>

      {/* Breadcrumb */}
      <div className="mb-4">
        <FolderBreadcrumb serverId={serverId} currentPath={currentPath} />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && files.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">This folder is empty</p>
          <p className="text-sm mt-1">Upload files or create a folder to get started</p>
        </div>
      )}

      {/* File list */}
      {!loading && !error && files.length > 0 && (
        <div className="space-y-0.5">
          {files.map((file) => (
            <FileCard
              key={file.path}
              file={file}
              serverId={serverId}
              selectionMode={selectionMode}
              selected={selectedFiles.has(file.path)}
              onClick={() => handleFileClick(file)}
              onSelect={() => toggleSelection(file.path)}
            />
          ))}
        </div>
      )}

      {/* Preview modal */}
      {previewFile && (
        <FilePreview
          file={previewFile}
          serverId={serverId}
          onClose={() => setPreviewFile(null)}
        />
      )}

      {/* Create folder dialog */}
      {showCreateFolder && (
        <CreateFolderDialog
          serverId={serverId}
          currentPath={currentPath}
          onCreated={handleRefresh}
          onClose={() => setShowCreateFolder(false)}
        />
      )}

      {/* Move dialog */}
      {showMoveDialog && (
        <MoveDialog
          serverId={serverId}
          selectedFiles={Array.from(selectedFiles)}
          onMoved={() => {
            setSelectedFiles(new Set());
            setSelectionMode(false);
            handleRefresh();
          }}
          onClose={() => setShowMoveDialog(false)}
        />
      )}
    </div>
  );
}
