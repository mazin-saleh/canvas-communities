import React from "react";
import AdminSidebar from "./AdminSidebar";
import { adminTheme } from "./adminTheme";

type AdminLayoutProps = {
  clubId: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function AdminLayout({ clubId, title, subtitle, children }: AdminLayoutProps) {
  return (
    <section
      className="min-h-full bg-[var(--admin-shell-bg)] p-3 sm:p-4 lg:p-6"
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
      <header className="overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-white">
        <div
          className="h-2 w-full"
          style={{
            backgroundImage: adminTheme.headerGradient,
          }}
        />
        <div className="px-4 py-4 sm:px-5 sm:py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--admin-brand-teal)]">
            Club Management
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
        </div>
      </header>

      <div className="mt-4 grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <AdminSidebar clubId={clubId} />
        <div className="min-w-0 rounded-2xl border border-[var(--admin-border)] bg-white p-4 shadow-sm sm:p-5">
          {children}
        </div>
      </div>
    </section>
  );
}
