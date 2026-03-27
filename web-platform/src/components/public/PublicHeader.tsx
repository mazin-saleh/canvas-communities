"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { label: "Announcements", href: "/announcements" },
  { label: "Explore Page", href: "/login" },
  { label: "Meet the Team", href: "/team" },
  { label: "Contact", href: "/contact" },
];

export default function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between gap-4 py-5">
        <Link href="/" className="flex items-center gap-2 min-w-fit">
          <Image
            src="/Frame.svg"
            alt="Canvas Communities Logo"
            width={32}
            height={32}
            className="h-8 w-auto"
          />
          <span className="text-sm sm:text-base font-semibold tracking-tight text-white">
            Connector
          </span>
        </Link>

        <nav className="hidden md:flex items-center justify-center flex-1 gap-10 text-sm text-white/90">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 min-w-fit">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/30 text-white/90 hover:text-white hover:border-white/50"
          >
            <span className="sr-only">Open menu</span>
            <span aria-hidden="true" className="flex flex-col gap-1.5">
              <span className="h-0.5 w-5 rounded-full bg-current" />
              <span className="h-0.5 w-5 rounded-full bg-current" />
              <span className="h-0.5 w-5 rounded-full bg-current" />
            </span>
          </button>

          <Link
            href="/login"
            className="hidden md:inline-flex px-4 py-2 rounded-md bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            UFL Login
          </Link>

          <Link
            href="/signup"
            className="hidden md:inline-flex px-4 py-2 rounded-md bg-white text-slate-900 text-sm font-medium ring-1 ring-slate-200 hover:bg-slate-50 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </header>

      {mobileMenuOpen && (
        <nav className="md:hidden -mt-1 mb-2 flex flex-col gap-1 rounded-[14px] border border-white/15 bg-white/5 p-2">
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-[10px] px-3 py-2 text-sm font-medium text-[#f9510e] border border-[#f9510e] hover:bg-[#f9510e]/10"
          >
            UFL Login
          </Link>
          <Link
            href="/signup"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-[10px] px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white"
          >
            Sign up
          </Link>
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-[10px] px-3 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
