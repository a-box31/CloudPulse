"use client";

import { useState } from "react";
import Link from "next/link";

function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="3" y="6" width="26" height="20" rx="3" className="fill-blue-500" />
      <rect x="3" y="20" width="26" height="6" rx="1.5" className="fill-blue-600" />
      <circle cx="24" cy="23" r="1.5" className="fill-blue-300" />
      <path
        d="M16 11.5c-.8-1.8-3-2.5-4.5-1.2s-1.7 3.5 0 5.2l4.5 4 4.5-4c1.7-1.7 1.5-3.9 0-5.2s-3.7-.6-4.5 1.2z"
        className="fill-white/90"
      />
    </svg>
  );
}

export { Logo };

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Logo />
          <span className="text-xl font-bold tracking-tight">
            <span className="text-blue-400">Cloud</span>Pulse
          </span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/docs"
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            Docs
          </Link>
          <a
            href="https://github.com/a-box31/CloudPulse"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://hub.docker.com/r/abox31/cloudpulse"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            Docker Hub
          </a>
          <a
            href="https://www.abinthomas.net"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            Website
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

        {/* Hamburger button */}
        <button
          className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-800 px-6 py-4 flex flex-col gap-4 bg-gray-950">
          <Link
            href="/docs"
            className="text-sm text-gray-300 hover:text-white transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Docs
          </Link>
          <a
            href="https://github.com/a-box31/CloudPulse"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://hub.docker.com/r/abox31/cloudpulse"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            Docker Hub
          </a>
          <a
            href="https://www.abinthomas.net"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            Website
          </a>
          <Link
            href="/login"
            className="text-sm text-gray-300 hover:text-white transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors text-center"
            onClick={() => setMenuOpen(false)}
          >
            Get started
          </Link>
        </div>
      )}
    </nav>
  );
}
