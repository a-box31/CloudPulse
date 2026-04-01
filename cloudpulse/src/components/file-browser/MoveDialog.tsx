"use client";

import { useState, useEffect, useCallback } from "react";
import { authFetch } from "@/lib/auth-fetch";
import type { FileInfo } from "@/types";

interface MoveDialogProps {
  serverId: string;
  selectedFiles: string[];
  onMoved: () => void;
  onClose: () => void;
}

export function MoveDialog({
  serverId,
  selectedFiles,
  onMoved,
  onClose,
}: MoveDialogProps) {
  const [browsePath, setBrowsePath] = useState("/");
  const [folders, setFolders] = useState<FileInfo[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [search, setSearch] = useState("");
  const [moving, setMoving] = useState(false);
  const [error, setError] = useState("");

  const fetchFolders = useCallback(
    async (dirPath: string) => {
      setLoadingFolders(true);
      try {
        const res = await authFetch(
          `/api/files/${serverId}?path=${encodeURIComponent(dirPath)}`
        );
        if (res.ok) {
          const data = await res.json();
          const dirs = (data.files || []).filter(
            (f: FileInfo) => f.isDirectory
          );
          setFolders(dirs);
        } else {
          setFolders([]);
        }
      } catch {
        setFolders([]);
      } finally {
        setLoadingFolders(false);
      }
    },
    [serverId]
  );

  useEffect(() => {
    fetchFolders(browsePath);
  }, [browsePath, fetchFolders]);

  const filteredFolders = search
    ? folders.filter((f) =>
        f.name.toLowerCase().includes(search.toLowerCase())
      )
    : folders;

  const breadcrumbSegments = browsePath === "/"
    ? ["/"]
    : ["/", ...browsePath.split("/").filter(Boolean)];

  function handleBreadcrumbClick(index: number) {
    if (index === 0) {
      setBrowsePath("/");
    } else {
      const newPath = "/" + breadcrumbSegments.slice(1, index + 1).join("/");
      setBrowsePath(newPath);
    }
    setSearch("");
  }

  function handleFolderClick(folder: FileInfo) {
    setBrowsePath(folder.path);
    setSearch("");
  }

  async function handleMove() {
    if (selectedFiles.length === 0) return;

    setMoving(true);
    setError("");

    try {
      const dest = browsePath.replace(/\/+$/, "") || "";

      for (const filePath of selectedFiles) {
        const fileName = filePath.split("/").pop();
        const to = dest + "/" + fileName;

        const res = await authFetch(`/api/files/${serverId}/move`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ from: filePath, to }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || `Failed to move ${fileName}`);
          return;
        }
      }

      onMoved();
      onClose();
    } catch {
      setError("Network error");
    } finally {
      setMoving(false);
    }
  }

  // Check if moving here would be a no-op (same parent directory)
  const allInCurrentDir = selectedFiles.every((f) => {
    const parent = f.substring(0, f.lastIndexOf("/")) || "/";
    return parent === browsePath;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md mx-4 p-5 bg-gray-900 rounded-xl border border-gray-700 flex flex-col max-h-[80vh]">
        <h3 className="text-base font-medium text-white mb-1">
          Move {selectedFiles.length} item{selectedFiles.length > 1 ? "s" : ""}
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Browse to a destination folder
        </p>

        {error && (
          <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Search input */}
        <div className="relative mb-3">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter folders..."
            className="w-full pl-8 pr-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 mb-2 text-xs overflow-x-auto scrollbar-none">
          {breadcrumbSegments.map((seg, i) => (
            <span key={i} className="flex items-center gap-1 shrink-0">
              {i > 0 && <span className="text-gray-600">/</span>}
              <button
                type="button"
                onClick={() => handleBreadcrumbClick(i)}
                className={`hover:text-white transition-colors ${
                  i === breadcrumbSegments.length - 1
                    ? "text-blue-400 font-medium"
                    : "text-gray-400"
                }`}
              >
                {seg === "/" ? "Root" : seg}
              </button>
            </span>
          ))}
        </div>

        {/* Folder list */}
        <div className="flex-1 min-h-0 overflow-y-auto border border-gray-800 rounded-lg bg-gray-950 mb-3">
          {loadingFolders ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : filteredFolders.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-xs">
              {search ? "No matching folders" : "No subfolders"}
            </div>
          ) : (
            <div className="divide-y divide-gray-800/50">
              {filteredFolders.map((folder) => (
                <button
                  key={folder.path}
                  type="button"
                  onClick={() => handleFolderClick(folder)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-gray-800/50 transition-colors group"
                >
                  <svg
                    className="w-4 h-4 text-blue-400 shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M2 6a2 2 0 012-2h5l2 2h9a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                  <span className="text-sm text-gray-300 group-hover:text-white truncate">
                    {folder.name}
                  </span>
                  <svg
                    className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 ml-auto shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected files preview */}
        <div className="mb-3 max-h-20 overflow-y-auto text-xs text-gray-500 space-y-0.5">
          {selectedFiles.map((f) => (
            <div key={f} className="truncate">
              {f}
            </div>
          ))}
        </div>

        {/* Destination display */}
        <div className="mb-3 px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <span className="text-xs text-gray-400">Move to: </span>
          <span className="text-xs text-white font-mono">{browsePath}</span>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleMove}
            disabled={moving || allInCurrentDir}
            className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {moving ? "Moving..." : "Move here"}
          </button>
        </div>
      </div>
    </div>
  );
}
