"use client";

import { useState, useEffect } from "react";
import { authFetch } from "@/lib/auth-fetch";
import type { ServerInfo } from "@/types";

interface NewServer {
  id: string;
  name: string;
  apiKey: string;
}

export default function ManageServersPage() {
  const [servers, setServers] = useState<ServerInfo[]>([]);
  const [newServerName, setNewServerName] = useState("");
  const [newServer, setNewServer] = useState<NewServer | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  async function fetchServers() {
    try {
      const res = await authFetch("/api/servers");
      if (res.ok) {
        const data = await res.json();
        setServers(data.servers || []);
      }
    } catch {
      // Network error
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchServers();
  }, []);

  async function handleAddServer(e: React.FormEvent) {
    e.preventDefault();
    if (!newServerName.trim()) return;

    setAdding(true);
    try {
      const res = await authFetch("/api/servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newServerName }),
      });

      if (res.ok) {
        const data = await res.json();
        setNewServer(data.server);
        setNewServerName("");
        fetchServers();
      }
    } catch {
      // Network error
    } finally {
      setAdding(false);
    }
  }

  async function handleDeleteServer(serverId: string) {
    if (!confirm("Are you sure? This will unregister this server.")) return;

    await authFetch(`/api/servers/${serverId}`, {
      method: "DELETE",
    });

    fetchServers();
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <a
            href="/dashboard"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </a>
          <h1 className="text-xl font-bold text-white">Manage Servers</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Add Server Form */}
        <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl">
          <h2 className="text-lg font-semibold text-white mb-4">
            Add a Server
          </h2>
          <form onSubmit={handleAddServer} className="flex gap-3">
            <input
              type="text"
              value={newServerName}
              onChange={(e) => setNewServerName(e.target.value)}
              placeholder='Server name (e.g. "Home PC")'
              className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={adding || !newServerName.trim()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium rounded-lg transition-colors"
            >
              {adding ? "Adding..." : "Add"}
            </button>
          </form>
        </div>

        {/* Show credentials once after creation */}
        {newServer && (
          <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl">
            <h3 className="text-lg font-semibold text-green-400 mb-2">
              Server registered!
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              Copy these credentials to your Express backend&apos;s{" "}
              <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs">
                .env
              </code>{" "}
              file. The API key is only shown once.
            </p>
            <div className="space-y-2 font-mono text-sm">
              <div className="p-3 bg-gray-900 rounded-lg">
                <span className="text-gray-500">SERVER_ID=</span>
                <span className="text-white">{newServer.id}</span>
              </div>
              <div className="p-3 bg-gray-900 rounded-lg">
                <span className="text-gray-500">API_KEY=</span>
                <span className="text-white">{newServer.apiKey}</span>
              </div>
            </div>
            <button
              onClick={() => setNewServer(null)}
              className="mt-4 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Server List */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            Your Servers
          </h2>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          )}

          {!loading && servers.length === 0 && (
            <p className="text-gray-500 py-8 text-center">
              No servers registered yet.
            </p>
          )}

          {!loading && servers.length > 0 && (
            <div className="space-y-3">
              {servers.map((server) => (
                <div
                  key={server.id}
                  className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${server.isOnline ? "bg-green-500" : "bg-gray-600"}`}
                    />
                    <div>
                      <p className="font-medium text-white">{server.name}</p>
                      <p className="text-xs text-gray-500">
                        {server.isOnline ? "Online" : "Offline"}
                        {server.lastSeen &&
                          ` \u00B7 Last seen ${new Date(server.lastSeen).toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteServer(server.id)}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
