"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AdminSidebarProps = {
  clubId: string;
};

type NavItem = {
  label: string;
  href: string;
  matchPrefix: string;
};

export default function AdminSidebar({ clubId }: AdminSidebarProps) {
  const pathname = usePathname();

  const items: NavItem[] = [
    {
      label: "General Info",
      href: `/club-admin/${clubId}/general-info`,
      matchPrefix: `/club-admin/${clubId}/general-info`,
    },
    {
      label: "Roster",
      href: `/club-admin/${clubId}/roster`,
      matchPrefix: `/club-admin/${clubId}/roster`,
    },
    {
      label: "Content",
      href: `/club-admin/${clubId}/content`,
      matchPrefix: `/club-admin/${clubId}/content`,
    },
    {
      label: "Settings",
      href: `/club-admin/${clubId}/settings`,
      matchPrefix: `/club-admin/${clubId}/settings`,
    },
  ];

  return (
    <aside className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-sidebar-bg)] p-4 shadow-sm lg:p-5">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--admin-brand-teal)]">
        Admin Dashboard
      </h2>
      <nav className="space-y-2">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.matchPrefix}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={[
                "group flex items-center justify-between rounded-xl border px-3 py-2 text-sm font-semibold transition-colors duration-150",
                isActive
                  ? "border-[var(--admin-brand-orange)] bg-[var(--admin-brand-orange-soft)] text-[var(--admin-brand-orange)]"
                  : "border-transparent text-slate-600 hover:border-[var(--admin-brand-teal)] hover:bg-[var(--admin-brand-teal-soft)] hover:text-[var(--admin-brand-teal)]",
              ].join(" ")}
            >
              <span>{item.label}</span>
              <span
                className={[
                  "h-2 w-2 rounded-full transition-colors duration-150",
                  isActive ? "bg-[var(--admin-brand-orange)]" : "bg-transparent group-hover:bg-[var(--admin-brand-teal)]",
                ].join(" ")}
              />
            </Link>
          );
        })}
      </nav>

      <div className="mt-5 rounded-xl border border-[var(--admin-border)] bg-white p-3 text-xs text-slate-600">
        <p className="font-semibold text-slate-800">Need to publish an update?</p>
        <p className="mt-1">Use the content tools to draft announcements and events for your members.</p>
        <Link
          href={`/club-admin/${clubId}/create-post`}
          className="mt-2 inline-flex font-semibold text-[var(--admin-brand-teal)] underline-offset-2 hover:underline"
        >
          Create a post
        </Link>
      </div>
    </aside>
  );
}
