"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/auth-fetch";
import type { FileInfo } from "@/types";

interface SearchDialogProps {
  serverId: string;
  onClose: () => void;
}

export function SearchDialog({ serverId, onClose }: SearchDialogProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        setSearched(false);
        setError("");
        return;
      }

      setLoading(true);
      setSearched(true);
      setError("");

      try {
        const res = await authFetch(
          `/api/files/${serverId}/search?q=${encodeURIComponent(q.trim())}&limit=50`
        );
        const data = await res.json();
        if (res.ok) {
          setResults(data.results || []);
        } else {
          setResults([]);
          setError(data.error || `Search failed (${res.status})`);
        }
      } catch {
        setResults([]);
        setError("Network error — is the server running?");
      } finally {
        setLoading(false);
      }
    },
    [serverId]
  );

  // Debounced search on input change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleResultClick(file: FileInfo) {
    if (file.isDirectory) {
      router.push(`/dashboard/${serverId}${file.path}`);
    } else {
      // Navigate to the parent directory of the file
      const parentDir =
        file.path.substring(0, file.path.lastIndexOf("/")) || "/";
      router.push(`/dashboard/${serverId}${parentDir}`);
    }
    onClose();
  }

  function getParentPath(filePath: string): string {
    const parent = filePath.substring(0, filePath.lastIndexOf("/"));
    return parent || "/";
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  // Highlight matching text in the name
  function highlightMatch(name: string): React.ReactNode {
    if (!query.trim()) return name;
    const lowerName = name.toLowerCase();
    const lowerQuery = query.trim().toLowerCase();
    const idx = lowerName.indexOf(lowerQuery);
    if (idx === -1) return name;

    return (
      <>
        {name.slice(0, idx)}
        <span className="text-blue-400 font-medium">
          {name.slice(idx, idx + query.trim().length)}
        </span>
        {name.slice(idx + query.trim().length)}
      </>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg mx-4 bg-gray-900 rounded-xl border border-gray-700 shadow-2xl flex flex-col max-h-[60vh] overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
          <svg
            className="w-5 h-5 text-gray-400 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files and folders..."
            className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 focus:outline-none"
          />
          {loading && (
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full shrink-0" />
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] text-gray-500 bg-gray-800 rounded border border-gray-700">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {!searched && !loading && !error && (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">
              Type to search across all files and folders
            </div>
          )}

          {error && (
            <div className="mx-4 mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs">
              {error}
            </div>
          )}

          {searched && !loading && !error && results.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}

          {results.length > 0 && (
            <div className="py-1">
              {results.map((file) => (
                <button
                  key={file.path}
                  onClick={() => handleResultClick(file)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800/60 transition-colors text-left group"
                >
                  {/* Icon */}
                  {file.isDirectory ? (
                    <svg
                      className="w-5 h-5 text-blue-400 shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M2 6a2 2 0 012-2h5l2 2h9a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-gray-400 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                      />
                    </svg>
                  )}

                  {/* Name and path */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-200 truncate">
                      {highlightMatch(file.name)}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {getParentPath(file.path)}
                    </div>
                  </div>

                  {/* Size */}
                  {!file.isDirectory && (
                    <span className="text-xs text-gray-600 shrink-0">
                      {formatSize(file.sizeBytes)}
                    </span>
                  )}

                  {/* Arrow */}
                  <svg
                    className="w-4 h-4 text-gray-700 group-hover:text-gray-500 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {results.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-800 text-xs text-gray-500">
            {results.length} result{results.length !== 1 ? "s" : ""} found
          </div>
        )}
      </div>
    </div>
  );
}
