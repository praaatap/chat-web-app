import Link from "next/link";
import { ReactNode } from "react";

const ROUTES = [
  { href: "/workspace/execution", label: "Execution Hub" },
  { href: "/workspace/delivery", label: "Delivery Command" },
  { href: "/workspace/collab", label: "Collaboration Stream" },
  { href: "/workspace/rituals", label: "Ritual Operations" },
];

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-full overflow-hidden bg-zinc-100">
      <div className="mx-auto flex h-full max-w-screen-2xl flex-col">
        <nav className="flex items-center gap-2 border-b border-zinc-200 bg-white px-6 py-3">
          {ROUTES.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-zinc-700 transition hover:bg-zinc-100"
            >
              {route.label}
            </Link>
          ))}
        </nav>
        <div className="min-h-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
