"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/auth-fetch";
import { FileCard } from "./FileCard";
import { FolderBreadcrumb } from "./FolderBreadcrumb";
import { Toolbar } from "./Toolbar";
import { CreateFolderDialog } from "./CreateFolderDialog";
import { MoveDialog } from "./MoveDialog";
import { SearchDialog } from "./SearchDialog";
import type { FileInfo } from "@/types";

export type SortField = "name" | "date" | "size";

interface FileBrowserProps {
  serverId: string;
  currentPath: string;
}

export function FileBrowser({ serverId, currentPath }: FileBrowserProps) {
  const router = useRouter();
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sorting
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortReversed, setSortReversed] = useState(false);

  // Selection
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  // Dialogs
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await authFetch(
        `/api/files/${serverId}?path=${encodeURIComponent(currentPath)}`
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

  const sortedFiles = useMemo(() => {
    const sorted = [...files].sort((a, b) => {
      // Directories always come first
      if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;

      let cmp = 0;
      switch (sortField) {
        case "name":
          cmp = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
          break;
        case "date":
          cmp = new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime();
          break;
        case "size":
          cmp = a.sizeBytes - b.sizeBytes;
          break;
      }
      return sortReversed ? -cmp : cmp;
    });
    return sorted;
  }, [files, sortField, sortReversed]);

  function handleFileClick(file: FileInfo) {
    if (file.isDirectory) {
      router.push(`/dashboard/${serverId}${file.path}`);
    } else {
      const token = localStorage.getItem("token") || "";
      const streamUrl = `/api/files/${serverId}/stream?path=${encodeURIComponent(file.path)}&token=${encodeURIComponent(token)}`;
      window.open(streamUrl, "_blank");
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

    for (const filePath of selectedFiles) {
      await authFetch(`/api/files/${serverId}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: filePath }),
      });
    }

    setSelectedFiles(new Set());
    setSelectionMode(false);
    fetchFiles();
  }

  async function handleRename(file: FileInfo, newName: string) {
    const parentDir = file.path.substring(0, file.path.lastIndexOf("/")) || "/";
    const newPath = parentDir === "/" ? `/${newName}` : `${parentDir}/${newName}`;

    try {
      const res = await authFetch(`/api/files/${serverId}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: file.path, to: newPath }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to rename");
      }
    } catch {
      alert("Network error while renaming");
    }

    fetchFiles();
  }

  function handleRefresh() {
    fetchFiles();
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="sticky top-[57px] z-20 bg-gray-950 pb-4 -mx-6 px-6 pt-4 -mt-4">
        <Toolbar
          serverId={serverId}
          currentPath={currentPath}
          selectionMode={selectionMode}
          selectedCount={selectedFiles.size}
          sortField={sortField}
          sortReversed={sortReversed}
          onSortChange={setSortField}
          onSortReversedChange={setSortReversed}
          onToggleSelect={handleToggleSelectionMode}
          onSelectAll={toggleSelectAll}
          onNewFolder={() => setShowCreateFolder(true)}
          onDelete={handleDelete}
          onMove={() => setShowMoveDialog(true)}
          onUploadComplete={handleRefresh}
          onSearch={() => setShowSearch(true)}
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
          {sortedFiles.map((file) => (
            <FileCard
              key={file.path}
              file={file}
              serverId={serverId}
              selectionMode={selectionMode}
              selected={selectedFiles.has(file.path)}
              onClick={() => handleFileClick(file)}
              onSelect={() => toggleSelection(file.path)}
              onRename={handleRename}
            />
          ))}
        </div>
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

      {/* Search dialog */}
      {showSearch && (
        <SearchDialog
          serverId={serverId}
          onClose={() => setShowSearch(false)}
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
