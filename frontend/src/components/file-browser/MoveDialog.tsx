"use client";

import { useState } from "react";

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
  const [destination, setDestination] = useState("/");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!destination.trim()) return;

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");
      const dest = destination.replace(/\/+$/, "");

      for (const filePath of selectedFiles) {
        const fileName = filePath.split("/").pop();
        const to = dest + "/" + fileName;

        const res = await fetch(`/api/files/${serverId}/move`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
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
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-sm mx-4 p-5 bg-gray-900 rounded-xl border border-gray-700">
        <h3 className="text-base font-medium text-white mb-1">
          Move {selectedFiles.length} item{selectedFiles.length > 1 ? "s" : ""}
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Enter the destination folder path
        </p>

        {error && (
          <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="/destination/folder"
            autoFocus
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
          <div className="mt-3 max-h-32 overflow-y-auto text-xs text-gray-500 space-y-0.5">
            {selectedFiles.map((f) => (
              <div key={f} className="truncate">{f}</div>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !destination.trim()}
              className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors"
            >
              {loading ? "Moving..." : "Move"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
