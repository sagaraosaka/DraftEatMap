"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function IconMap({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>
  );
}

function IconList({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" className={className}>
      <path d="M4 6h16M4 12h16M4 18h16"/>
    </svg>
  );
}

function IconSettings({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" className={className}>
      <line x1="4" y1="6" x2="20" y2="6"/>
      <line x1="4" y1="12" x2="20" y2="12"/>
      <line x1="4" y1="18" x2="20" y2="18"/>
      <line x1="8" y1="4" x2="8" y2="8"/>
      <line x1="15" y1="10" x2="15" y2="14"/>
      <line x1="11" y1="16" x2="11" y2="20"/>
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/map",      label: "マップ",   Icon: IconMap      },
  { href: "/list",     label: "リスト",   Icon: IconList     },
  { href: "/settings", label: "設定",     Icon: IconSettings },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="flex border-t border-eat-border bg-white pb-safe">
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center gap-0.5 py-2"
          >
            <Icon className={`h-5 w-5 transition-colors ${active ? "text-eat-accent" : "text-eat-text3"}`} />
            <span
              className={`text-[10px] font-medium transition-colors ${
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
