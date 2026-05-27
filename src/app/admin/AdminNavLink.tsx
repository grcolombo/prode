"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
        active
          ? "bg-[#2d1a5e] text-white"
          : "text-[#c4a7f0] hover:text-[#e0d0f8]"
      }`}
    >
      {label}
    </Link>
  );
}
