"use client";

import { use } from "react";
import { FileBrowser } from "@/components/file-browser/FileBrowser";

export default function NestedFolderPage({
  params,
}: {
  params: Promise<{ serverId: string; path: string[] }>;
}) {
  const { serverId, path } = use(params);
  const currentPath = "/" + path.map(decodeURIComponent).join("/");

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a
              href="/dashboard"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </a>
            <h1 className="text-xl font-bold text-white">Files</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        <FileBrowser serverId={serverId} currentPath={currentPath} />
      </main>
    </div>
  );
}
