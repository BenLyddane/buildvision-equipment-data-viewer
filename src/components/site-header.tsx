"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/equipment", label: "Equipment" },
  { href: "/manufacturers", label: "Manufacturers" },
  { href: "/component-types", label: "Component Types" },
  { href: "/insights", label: "Insights" },
  { href: "/queries", label: "Ask AI" },
];

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-6 px-6 md:px-10">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logos/buildvision-logo.png"
            alt="BuildVision"
            width={160}
            height={32}
            priority
            className="h-8 w-auto"
          />
          <span className="hidden text-detail font-bold uppercase tracking-wide text-neutral-500 md:inline">
            Data Viewer
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "rounded-md px-3 py-1.5 text-detail font-medium transition-colors",
                  isActive
                    ? "bg-bv-blue-100 text-bv-blue-400"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
