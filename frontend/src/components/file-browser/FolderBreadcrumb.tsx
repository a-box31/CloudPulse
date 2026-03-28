"use client";

import Link from "next/link";

interface FolderBreadcrumbProps {
  serverId: string;
  currentPath: string;
}

export function FolderBreadcrumb({ serverId, currentPath }: FolderBreadcrumbProps) {
  const segments = currentPath.split("/").filter(Boolean);

  const crumbs = [
    { name: "Home", path: "/" },
    ...segments.map((seg, i) => ({
      name: seg,
      path: "/" + segments.slice(0, i + 1).join("/"),
    })),
  ];

  return (
    <nav className="flex items-center gap-1 text-sm text-gray-400 overflow-x-auto">
      {crumbs.map((crumb, i) => (
        <span key={crumb.path} className="flex items-center gap-1 shrink-0">
          {i > 0 && <span className="text-gray-600">/</span>}
          {i === crumbs.length - 1 ? (
            <span className="text-white font-medium">{crumb.name}</span>
          ) : (
            <Link
              href={`/dashboard/${serverId}${crumb.path === "/" ? "" : crumb.path}`}
              className="hover:text-white transition-colors"
            >
              {crumb.name}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
