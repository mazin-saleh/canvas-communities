"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useRole } from "@/context/RoleContext";
import {
  Compass,
  Activity,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Shield,
  Wrench,
} from "lucide-react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";

export default function Sidebar() {
  const pathname = usePathname();
  const { clubs, isSuperAdmin, isClubOwnerOrAdmin } = useRole();
  // Always start with the same value on server + client to avoid a hydration
  // mismatch, then hydrate from localStorage in an effect once the client mounts.
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState(false);
  const quickAccessClubs = clubs.slice(0, 6);

  // Read persisted state once on mount
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("sidebar-collapsed");
      if (saved) setCollapsed(JSON.parse(saved));
    } catch {
      // ignore malformed localStorage
    }
    setHydrated(true);
  }, []);

  // Persist after hydration so we don't overwrite the saved value with the initial default
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed));
    } catch {
      // ignore storage errors (quota, disabled storage, etc.)
    }
  }, [collapsed, hydrated]);

  const mainNav = [
    { label: "Discover", href: "/discovery", icon: Compass },
    { label: "Activity", href: "/activity", icon: Activity },
  ];

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="h-screen border-r bg-white flex flex-col overflow-hidden"
    >
      {/* ───────── HEADER ───────── */}
      <div className="h-16 border-b px-3 flex items-center">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center w-full"
        >
          <div className="w-9 h-9 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold shrink-0">
            CC
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="ml-3 font-semibold text-sm whitespace-nowrap flex-1"
              >
                Canvas Communities
              </motion.span>
            )}
          </AnimatePresence>

          <div className="w-6 flex justify-center">
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-gray-500" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-gray-500" />
            )}
          </div>
        </button>
      </div>

      {/* ───────── NAV ───────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {mainNav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-md px-3 py-2 text-sm transition
              ${
                active
                  ? "bg-gray-100 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="w-6 flex justify-center">
                <Icon className="w-5 h-5" />
              </div>

              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="ml-3 whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}

        {isSuperAdmin && (
          <Link
            href="/admin/requests"
            className={`flex items-center rounded-md px-3 py-2 text-sm transition ${
              pathname.startsWith("/admin")
                ? "bg-gray-100 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <div className="w-6 flex justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="ml-3 whitespace-nowrap"
                >
                  Admin Panel
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        )}

        {!collapsed && (
          <div className="pt-4 pb-2 text-xs font-medium text-gray-400 px-3">
            YOUR CLUBS
          </div>
        )}

        {quickAccessClubs.map((club) => {
          const active = pathname.startsWith(`/club/${club.clubId}`);
          const canEditClub = isClubOwnerOrAdmin(club.clubId);

          return (
            <div key={club.clubId} className="space-y-1">
              <Link
                href={`/club/${club.clubId}`}
                className={`flex items-center rounded-md px-3 py-2 text-sm transition ${
                  active
                    ? "bg-gray-100 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div className="w-6 flex justify-center">
                  <Avatar className="h-6 w-6 rounded-md">
                    <AvatarImage
                      src={club.avatarUrl || "/avatars/placeholder.png"}
                      alt={club.clubName}
                    />
                    <AvatarFallback className="text-[10px]">
                      {club.clubName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="ml-3 truncate"
                    >
                      {club.clubName}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {!collapsed && canEditClub && (
                <Link
                  href={`/club-admin/${club.clubId}`}
                  className="ml-9 flex items-center rounded-md px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
                >
                  <Wrench className="h-3.5 w-3.5 mr-1.5" />
                  Club Editing Panel
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* ───────── DEV TEST LINKS ───────── */}
      {process.env.NODE_ENV === "development" && isSuperAdmin && (
        <div className="border-t pt-3 pb-2 px-2 space-y-1">
          {!collapsed && (
            <div className="text-xs font-medium text-gray-400 px-3">
              DEV
            </div>
          )}

          {isSuperAdmin && (
            <Link
              href="/club-admin/create-community"
              className="flex items-center rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
            >
              <div className="w-6 flex justify-center">🛠</div>
              {!collapsed && <span className="ml-3">Create Community</span>}
            </Link>
          )}
        </div>
      )}

      {/* ───────── FOOTER ───────── */}
      <div className="border-t p-3">
        <Link
          href="/settings"
          className="flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <div className="w-6 flex justify-center">
            <Settings className="w-5 h-5" />
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="ml-3"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>
    </motion.aside>
  );
}
