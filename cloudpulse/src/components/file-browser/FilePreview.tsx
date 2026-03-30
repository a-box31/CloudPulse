"use client";

import { useState, useEffect, useRef } from "react";
import { authFetch } from "@/lib/auth-fetch";
import type { FileInfo } from "@/types";

interface FilePreviewProps {
  file: FileInfo;
  serverId: string;
  onClose: () => void;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function FilePreview({ file, serverId, onClose }: FilePreviewProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const streamUrl = `/api/files/${serverId}/stream?path=${encodeURIComponent(file.path)}`;
  const downloadUrl = `/api/files/${serverId}/download?path=${encodeURIComponent(file.path)}`;
  const type = file.mimeType?.split("/")[0];

  // Fetch text content for text files
  useEffect(() => {
    if (
      type === "text" ||
      file.mimeType === "application/json" ||
      file.mimeType === "application/javascript" ||
      file.mimeType === "application/xml" ||
      file.mimeType === "application/x-yaml"
    ) {
      setLoading(true);
      authFetch(streamUrl)
        .then((r) => r.text())
        .then((text) => setTextContent(text))
        .catch(() => setTextContent("Failed to load file content"))
        .finally(() => setLoading(false));
    }
  }, [streamUrl, type, file.mimeType]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  function handleDownload() {
    const token = localStorage.getItem("accessToken");
    // Download uses a direct link — token passed as query param since
    // anchor tags can't set Authorization headers
    const a = document.createElement("a");
    a.href = `${downloadUrl}&token=${token}`;
    a.download = file.name;
    a.click();
  }

  function renderPreview() {
    // Images
    if (type === "image") {
      return (
        <img
          src={streamUrl}
          alt={file.name}
          className="max-w-full max-h-[75vh] object-contain rounded"
        />
      );
    }

    // Videos
    if (type === "video") {
      return (
        <video
          src={streamUrl}
          controls
          autoPlay
          className="max-w-full max-h-[75vh] rounded"
        />
      );
    }

    // Audio
    if (type === "audio") {
      return (
        <div className="flex flex-col items-center gap-4 py-12">
          <svg className="w-16 h-16 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
          </svg>
          <audio src={streamUrl} controls autoPlay className="w-full max-w-md" />
        </div>
      );
    }

    // PDF
    if (file.mimeType === "application/pdf") {
      return (
        <iframe
          src={streamUrl}
          className="w-full h-[75vh] rounded border border-gray-700"
        />
      );
    }

    // Text / code
    if (textContent !== null) {
      if (loading) {
        return (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        );
      }
      return (
        <pre className="w-full max-h-[75vh] overflow-auto p-4 bg-gray-800 rounded text-sm text-gray-200 font-mono whitespace-pre-wrap break-words">
          {textContent}
        </pre>
      );
    }

    // Unknown / no preview
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-gray-400">
        <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <p>No preview available for this file type</p>
        <p className="text-sm text-gray-500">{file.mimeType || "Unknown type"} — {formatSize(file.sizeBytes)}</p>
      </div>
    );
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <div className="w-full max-w-4xl mx-4 bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h3 className="text-sm font-medium text-white truncate">{file.name}</h3>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
            >
              Download
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex items-center justify-center p-4 min-h-[200px]">
          {renderPreview()}
        </div>
      </div>
    </div>
  );
}
