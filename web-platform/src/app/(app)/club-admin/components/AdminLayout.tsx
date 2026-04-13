"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { adminTheme } from "./adminTheme";
import { useClubAdmin } from "../[clubId]/ClubAdminContext";

type AdminLayoutProps = {
  clubId: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

type TabItem = {
  label: string;
  href: string;
  matchPrefix: string;
  visible: boolean;
};

export default function AdminLayout({ clubId, children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { club, isOwner, userPermissions } = useClubAdmin();

  const tabs: TabItem[] = [
    {
      label: "General Info",
      href: `/club-admin/${clubId}/general-info`,
      matchPrefix: `/club-admin/${clubId}/general-info`,
      visible: true,
    },
    {
      label: "Roster",
      href: `/club-admin/${clubId}/roster`,
      matchPrefix: `/club-admin/${clubId}/roster`,
      visible: isOwner || userPermissions.includes("canManageRoster"),
    },
    {
      label: "Roles",
      href: `/club-admin/${clubId}/roles`,
      matchPrefix: `/club-admin/${clubId}/roles`,
      visible: isOwner,
    },
    {
      label: "Settings",
      href: `/club-admin/${clubId}/settings`,
      matchPrefix: `/club-admin/${clubId}/settings`,
      visible: isOwner,
    },
  ];

  const visibleTabs = tabs.filter((t) => t.visible);

  return (
    <div
      className="flex min-h-full flex-col bg-[var(--admin-shell-bg)]"
      style={
        {
          "--admin-brand-orange": adminTheme.colors.brandOrange,
          "--admin-brand-orange-soft": adminTheme.colors.brandOrangeSoft,
          "--admin-brand-teal": adminTheme.colors.brandTeal,
          "--admin-brand-teal-soft": adminTheme.colors.brandTealSoft,
          "--admin-shell-bg": adminTheme.colors.shellBg,
          "--admin-sidebar-bg": adminTheme.colors.sidebarBg,
          "--admin-border": adminTheme.colors.border,
        } as React.CSSProperties
      }
    >
      {/* Compact header */}
      <header className="border-b border-[var(--admin-border)] bg-white">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <Link
            href={`/club/${clubId}`}
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 transition-colors hover:text-stone-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to club
          </Link>
          <div className="flex items-center gap-3">
            {club?.avatarUrl && (
              <img
                src={club.avatarUrl}
                alt=""
                className="h-9 w-9 rounded-lg object-cover"
              />
            )}
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-stone-900">
                {club?.name ?? "Club Admin"}
              </h1>
              <p className="text-xs text-stone-500">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <nav className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="-mb-px flex gap-1">
            {visibleTabs.map((tab) => {
              const isActive =
                pathname === tab.href ||
                pathname.startsWith(`${tab.matchPrefix}/`);

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={[
                    "border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "border-[var(--admin-brand-orange)] text-[var(--admin-brand-orange)]"
                      : "border-transparent text-stone-500 hover:border-stone-300 hover:text-stone-700",
                  ].join(" ")}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Content */}
      <main className="mx-auto flex-1 w-full max-w-4xl px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
