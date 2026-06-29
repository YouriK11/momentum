"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Aujourd'hui", icon: "🏠" },
  { href: "/groupes", label: "Groupes", icon: "👥" },
  { href: "/habits", label: "Habitudes", icon: "⚙️" },
  { href: "/profil", label: "Profil", icon: "👤" },
];

export function BottomNav() {
  const path = usePathname();
  if (path === "/login" || path === "/signup" || path?.startsWith("/auth")) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-800 bg-neutral-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-2xl">
        {tabs.map((t) => {
          const active = t.href === "/" ? path === "/" : path?.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-3 text-xs transition ${
                active ? "text-primary" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <span className="text-lg">{t.icon}</span>
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}