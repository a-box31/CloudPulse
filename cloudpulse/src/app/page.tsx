import Link from "next/link";

function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Hard drive body */}
      <rect x="3" y="6" width="26" height="20" rx="3" className="fill-blue-500" />
      {/* Drive slot line */}
      <rect x="3" y="20" width="26" height="6" rx="1.5" className="fill-blue-600" />
      {/* Drive indicator light */}
      <circle cx="24" cy="23" r="1.5" className="fill-blue-300" />
      {/* Heart on drive face */}
      <path
        d="M16 11.5c-.8-1.8-3-2.5-4.5-1.2s-1.7 3.5 0 5.2l4.5 4 4.5-4c1.7-1.7 1.5-3.9 0-5.2s-3.7-.6-4.5 1.2z"
        className="fill-white/90"
      />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo />
            <span className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">Cloud</span>Pulse
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/docs"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Docs
            </Link>
            <a
              href="#"
              className="text-sm text-gray-300 hover:text-white transition-colors"
              title="Docker Hub"
            >
              Docker Hub
            </a>
            <Link
              href="/login"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
        <h1 className="text-5xl font-bold tracking-tight leading-tight">
          Your files, your servers,
          <br />
          <span className="text-blue-400">your cloud.</span>
        </h1>
        <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
          CloudPulse is a self-hosted personal cloud platform that lets you
          manage files across multiple servers from a single dashboard. No
          third-party storage — everything stays on hardware you control.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/register"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Create an account
          </Link>
          <a
            href="#how-it-works"
            className="px-6 py-3 border border-gray-700 hover:border-gray-600 rounded-lg font-medium text-gray-300 hover:text-white transition-colors"
          >
            Learn more
          </a>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">How it works</h2>
        <p className="text-gray-400 text-center max-w-xl mx-auto mb-16">
          CloudPulse connects to servers you own and gives you a unified
          interface to browse, upload, and manage your files.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-lg mb-4">
              1
            </div>
            <h3 className="text-lg font-semibold mb-2">Register your servers</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Set up the CloudPulse agent on any machine you own — a Raspberry
              Pi, a VPS, a NAS. Register it with your account using an API key
              and it appears in your dashboard.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-lg mb-4">
              2
            </div>
            <h3 className="text-lg font-semibold mb-2">Browse & manage files</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Navigate your remote file systems through a familiar file-browser
              interface. Create folders, move files, rename items, and delete
              what you don&apos;t need.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-lg mb-4">
              3
            </div>
            <h3 className="text-lg font-semibold mb-2">Upload & download</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Upload files from your browser directly to any registered server.
              Download or stream files back whenever you need them — no size
              restrictions imposed by a third party.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Features</h2>
        <p className="text-gray-400 text-center max-w-xl mx-auto mb-16">
          Everything you need to take control of your personal cloud storage.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-1">Multi-server dashboard</h3>
            <p className="text-gray-400 text-sm">
              Manage all your servers from one place. See which are online, when
              they last checked in, and jump straight into their file systems.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-1">Server health monitoring</h3>
            <p className="text-gray-400 text-sm">
              Servers send periodic heartbeats so you always know their status.
              Quickly spot when a machine goes offline.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-1">Secure authentication</h3>
            <p className="text-gray-400 text-sm">
              JWT-based auth with short-lived access tokens and automatic refresh
              keeps your sessions secure without constant re-login.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-1">LAN & public access</h3>
            <p className="text-gray-400 text-sm">
              CloudPulse intelligently routes to your servers via public URL or
              LAN address, so it works whether you&apos;re home or away.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Create a free account and connect your first server in minutes.
          </p>
          <Link
            href="/register"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Create your account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-8">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Logo className="w-5 h-5" />
            <span>&copy; {new Date().getFullYear()} CloudPulse. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <Link href="/docs" className="hover:text-gray-300 transition-colors">
              Docs
            </Link>
            <a href="#" className="hover:text-gray-300 transition-colors">
              Docker Hub
            </a>
            <Link href="/login" className="hover:text-gray-300 transition-colors">
              Sign in
            </Link>
            <Link href="/register" className="hover:text-gray-300 transition-colors">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
