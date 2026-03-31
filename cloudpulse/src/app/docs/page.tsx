import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
          </Link>
          <h1 className="text-xl font-bold">Getting Started</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-12">
        {/* Intro */}
        <section>
          <p className="text-gray-400 leading-relaxed">
            This guide walks you through setting up a CloudPulse server agent on
            your machine using Docker. Once running, the agent connects to the
            CloudPulse dashboard so you can manage your files remotely.
          </p>
        </section>

        {/* Prerequisites */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Prerequisites</h2>
          <ul className="space-y-2 text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">&#8226;</span>
              <span>
                <strong className="text-white">Docker</strong> and{" "}
                <strong className="text-white">Docker Compose</strong> installed
                on the machine that will serve your files.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">&#8226;</span>
              <span>
                A <strong className="text-white">CloudPulse account</strong>.{" "}
                <Link href="/register" className="text-blue-400 hover:text-blue-300">
                  Create one here
                </Link>{" "}
                if you haven&apos;t already.
              </span>
            </li>
          </ul>
        </section>

        {/* Step 1 */}
        <section>
          <h2 className="text-2xl font-bold mb-4">
            <span className="text-blue-400">1.</span> Register a server
          </h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            Go to{" "}
            <Link
              href="/settings/servers"
              className="text-blue-400 hover:text-blue-300"
            >
              Settings &rarr; Manage Servers
            </Link>{" "}
            and add a new server. Give it a name you&apos;ll recognise (e.g.
            &ldquo;Home NAS&rdquo; or &ldquo;Raspberry Pi&rdquo;).
          </p>
          <p className="text-gray-400 leading-relaxed">
            After registering, you&apos;ll be shown a{" "}
            <strong className="text-white">Server ID</strong> and{" "}
            <strong className="text-white">API Key</strong>. Copy them
            somewhere safe &mdash; the API key is only displayed once.
          </p>
        </section>

        {/* Step 2 */}
        <section>
          <h2 className="text-2xl font-bold mb-4">
            <span className="text-blue-400">2.</span> Create a docker-compose.yml
          </h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            On the machine you want to serve files from, create a{" "}
            <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm text-white">
              docker-compose.yml
            </code>{" "}
            file with the following contents:
          </p>

          <div className="relative">
            <div className="absolute top-0 left-0 right-0 px-4 py-2 bg-gray-800 rounded-t-lg border border-gray-700 border-b-0">
              <span className="text-xs text-gray-400 font-mono">
                docker-compose.yml
              </span>
            </div>
            <pre className="mt-8 bg-gray-900 border border-gray-700 rounded-lg p-4 overflow-x-auto text-sm leading-relaxed">
              <code className="text-gray-300">{`services:
  cloudpulse:
    image: cloudpulse-server
    restart: unless-stopped
    network_mode: host
    environment:
      CLOUD_URL: https://cloudpulse.duckdns.org
      SERVER_ID: your-server-id
      API_KEY: your-api-key
      ROOT_DIR: /data
      PORT: 4000
    volumes:
      - /path/to/your/files:/data`}</code>
            </pre>
          </div>
        </section>

        {/* Step 3 */}
        <section>
          <h2 className="text-2xl font-bold mb-4">
            <span className="text-blue-400">3.</span> Configure the environment
          </h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            Replace the placeholder values with your own:
          </p>

          <div className="space-y-3">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <code className="text-blue-400 text-sm">SERVER_ID</code>
              <p className="text-gray-400 text-sm mt-1">
                The server ID you received when you registered the server.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <code className="text-blue-400 text-sm">API_KEY</code>
              <p className="text-gray-400 text-sm mt-1">
                The API key shown once after registration. This authenticates
                your server with CloudPulse.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <code className="text-blue-400 text-sm">CLOUD_URL</code>
              <p className="text-gray-400 text-sm mt-1">
                The URL of your CloudPulse dashboard. If you&apos;re using the
                hosted version, leave it as-is.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <code className="text-blue-400 text-sm">ROOT_DIR</code>
              <p className="text-gray-400 text-sm mt-1">
                The path inside the container that maps to your files. Leave
                as{" "}
                <code className="bg-gray-800 px-1 py-0.5 rounded text-xs text-white">
                  /data
                </code>{" "}
                and configure the volume mount instead.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <code className="text-blue-400 text-sm">PORT</code>
              <p className="text-gray-400 text-sm mt-1">
                The port the server agent listens on. Defaults to{" "}
                <code className="bg-gray-800 px-1 py-0.5 rounded text-xs text-white">
                  4000
                </code>
                .
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <code className="text-blue-400 text-sm">
                volumes &mdash; /path/to/your/files:/data
              </code>
              <p className="text-gray-400 text-sm mt-1">
                Replace{" "}
                <code className="bg-gray-800 px-1 py-0.5 rounded text-xs text-white">
                  /path/to/your/files
                </code>{" "}
                with the directory on your host machine you want to expose
                through CloudPulse.
              </p>
            </div>
          </div>
        </section>

        {/* Step 4 */}
        <section>
          <h2 className="text-2xl font-bold mb-4">
            <span className="text-blue-400">4.</span> Start the server
          </h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            From the directory containing your{" "}
            <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm text-white">
              docker-compose.yml
            </code>
            , run:
          </p>
          <pre className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-sm">
            <code className="text-gray-300">docker compose up -d</code>
          </pre>
          <p className="text-gray-400 leading-relaxed mt-4">
            The agent will start, register itself with CloudPulse, and begin
            sending heartbeats. Within a minute your server should appear as{" "}
            <span className="text-green-400 font-medium">online</span> in the
            dashboard.
          </p>
        </section>

        {/* Step 5 */}
        <section>
          <h2 className="text-2xl font-bold mb-4">
            <span className="text-blue-400">5.</span> Browse your files
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Head to the{" "}
            <Link
              href="/dashboard"
              className="text-blue-400 hover:text-blue-300"
            >
              Dashboard
            </Link>
            , click on your server, and you&apos;ll see the contents of the
            directory you mounted. From here you can upload, download, create
            folders, move, and delete files.
          </p>
        </section>

        {/* Notes */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Notes</h2>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">&#8226;</span>
              <span>
                The compose file uses{" "}
                <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs text-white">
                  network_mode: host
                </code>{" "}
                so the agent can be reached on your LAN without port-mapping
                issues. If you need bridge networking, remove this line and add a{" "}
                <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs text-white">
                  ports
                </code>{" "}
                mapping instead.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">&#8226;</span>
              <span>
                The server sends a heartbeat every 60 seconds. If the dashboard
                shows your server as offline, check that the container is running
                with{" "}
                <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs text-white">
                  docker compose logs -f
                </code>
                .
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">&#8226;</span>
              <span>
                To update to the latest image, run{" "}
                <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs text-white">
                  docker compose pull &amp;&amp; docker compose up -d
                </code>
                .
              </span>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
