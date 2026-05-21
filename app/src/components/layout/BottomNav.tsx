"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/map",      label: "マップ",   icon: "🗺️" },
  { href: "/list",     label: "リスト",   icon: "📝" },
  { href: "/settings", label: "設定",     icon: "⚙️" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="flex border-t border-eat-border bg-white pb-safe">
      {NAV_ITEMS.map(({ href, label, icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center gap-0.5 py-2"
          >
            <span className="text-lg leading-none">{icon}</span>
            <span
              className={`text-[10px] font-medium ${
                active ? "text-eat-accent" : "text-eat-text3"
              }`}
            >
              {label}
            </span>
            <span
              className={`h-1 w-1 rounded-full bg-eat-accent transition-opacity ${
                active ? "opacity-100" : "opacity-0"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
