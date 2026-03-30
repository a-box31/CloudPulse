"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/auth-fetch";
import type { ServerInfo } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const [servers, setServers] = useState<ServerInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchServers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">cloudpulse</h1>
          <div className="flex items-center gap-4">
            <a
              href="/settings/servers"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Manage Servers
            </a>
            <button
              onClick={() => {
                localStorage.removeItem("accessToken");
                document.cookie =
                  "accessToken=; path=/; max-age=0; samesite=lax";
                fetch("/api/auth/logout", { method: "POST" });
                router.push("/login");
              }}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-lg font-semibold text-white mb-6">Your Servers</h2>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        )}

        {!loading && servers.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">No servers registered yet.</p>
            <a
              href="/settings/servers"
              className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Add a Server
            </a>
          </div>
        )}

        {!loading && servers.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {servers.map((server) => (
              <button
                key={server.id}
                onClick={() => router.push(`/dashboard/${server.id}`)}
                className="p-5 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${server.isOnline ? "bg-green-500" : "bg-gray-600"}`}
                  />
                  <h3 className="font-medium text-white">{server.name}</h3>
                </div>
                <p className="text-xs text-gray-500">
                  {server.isOnline ? "Online" : "Offline"}
                  {server.lastSeen &&
                    ` \u00B7 Last seen ${new Date(server.lastSeen).toLocaleString()}`}
                </p>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
