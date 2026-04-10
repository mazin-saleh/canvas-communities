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
  Plus,
} from "lucide-react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";

type SidebarProps = {
  onNavigate?: () => void;
  forceExpanded?: boolean;
};

export default function Sidebar({ onNavigate, forceExpanded }: SidebarProps) {
  const pathname = usePathname();
  const { clubs, isSuperAdmin, isClubOwnerOrAdmin } = useRole();
  // Always start with the same value on server + client to avoid a hydration
  // mismatch, then hydrate from localStorage in an effect once the client mounts.
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState(false);
  const quickAccessClubs = clubs.slice(0, 6);
  const isCollapsed = forceExpanded ? false : collapsed;

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
      animate={{ width: isCollapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="h-screen border-r border-gray-200/80 bg-white flex flex-col overflow-hidden shrink-0"
    >
      {/* ───────── HEADER ───────── */}
      <div className="h-14 border-b border-gray-100 px-3 flex items-center">
        <Link href="/discovery" onClick={onNavigate} className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
            CC
          </div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="font-semibold text-[13px] whitespace-nowrap text-gray-900"
              >
                Canvas Communities
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* ───────── NAV ───────── */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {mainNav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center rounded-lg px-2.5 py-2 text-[13px] transition ${
                active
                  ? "bg-gray-100 font-medium text-gray-900"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <div className="w-5 flex justify-center shrink-0">
                <Icon className="w-[18px] h-[18px]" />
              </div>

              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="ml-2.5 whitespace-nowrap"
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
            className={`flex items-center rounded-lg px-2.5 py-2 text-[13px] transition ${
              pathname.startsWith("/admin")
                ? "bg-gray-100 font-medium text-gray-900"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            }`}
          >
            <div className="w-5 flex justify-center shrink-0">
              <Shield className="w-[18px] h-[18px]" />
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="ml-2.5 whitespace-nowrap"
                >
                  Admin Panel
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        )}

        {/* ───────── YOUR CLUBS ───────── */}
        {!collapsed && quickAccessClubs.length > 0 && (
          <div className="pt-4 pb-1 px-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Your Clubs
            </span>
          </div>
        )}

        {isCollapsed && quickAccessClubs.length > 0 && (
          <div className="pt-3 pb-1">
            <div className="mx-auto w-8 border-t border-gray-200" />
          </div>
        )}

        <div className="space-y-0.5">
          {quickAccessClubs.map((club) => {
            const active = pathname.startsWith(`/club/${club.clubId}`);
            const canEditClub = isClubOwnerOrAdmin(club.clubId);

            return (
              <div key={club.clubId} className="group/club relative">
                <Link
                  href={`/club/${club.clubId}`}
                  className={`flex items-center rounded-lg px-2.5 py-1.5 text-[13px] transition ${
                    active
                      ? "bg-gray-100 font-medium text-gray-900"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  <div className="w-5 flex justify-center shrink-0">
                    <Avatar className="h-5 w-5 rounded-md">
                      <AvatarImage
                        src={club.avatarUrl || "/avatars/placeholder.png"}
                        alt={club.clubName}
                      />
                      <AvatarFallback className="text-[8px] rounded-md">
                        {club.clubName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="ml-2.5 truncate flex-1"
                      >
                        {club.clubName}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Inline edit icon on hover — replaces the sub-link */}
                  {!collapsed && canEditClub && (
                    <span
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = `/club-admin/${club.clubId}`;
                      }}
                      className="opacity-0 group-hover/club:opacity-100 transition-opacity ml-1 p-0.5 rounded hover:bg-gray-200 shrink-0"
                      title="Club settings"
                    >
                      <Wrench className="h-3 w-3 text-gray-400" />
                    </span>
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      </nav>

      {/* ───────── FOOTER ───────── */}
      <div className="border-t border-gray-100 px-2 py-2 space-y-0.5">
        {/* Dev create community link */}
        {process.env.NODE_ENV === "development" && isSuperAdmin && (
          <Link
            href="/club-admin/create-community"
            onClick={onNavigate}
            className="flex items-center rounded-lg px-2.5 py-2 text-[13px] text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition"
          >
            <div className="w-5 flex justify-center shrink-0">
              <Plus className="w-[18px] h-[18px]" />
            </div>
            {!isCollapsed && <span className="ml-2.5">Create Community</span>}
          </Link>
        )}

        <Link
          href="/settings"
          onClick={onNavigate}
          className={`flex items-center rounded-lg px-2.5 py-2 text-[13px] transition ${
            pathname === "/settings"
              ? "bg-gray-100 font-medium text-gray-900"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          }`}
        >
          <div className="w-5 flex justify-center shrink-0">
            <Settings className="w-[18px] h-[18px]" />
          </div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="ml-2.5"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {/* Collapse toggle */}
        {!forceExpanded && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center rounded-lg px-2.5 py-2 text-[13px] text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition w-full"
          >
            <div className="w-5 flex justify-center shrink-0">
              {isCollapsed ? (
                <PanelLeftOpen className="w-[18px] h-[18px]" />
              ) : (
                <PanelLeftClose className="w-[18px] h-[18px]" />
              )}
            </div>
            {!isCollapsed && <span className="ml-2.5">Collapse</span>}
          </button>
        )}
      </div>
    </motion.aside>
  );
}
