"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="sticky top-0 z-30">
      <motion.div
        className="absolute inset-0 bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: scrolled ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
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
              Canvas Communities
            </span>
          </Link>

          <nav className="hidden md:flex items-center justify-center flex-1 gap-10 text-sm text-white/90">
            <Link
              href="/browse"
              className="hover:text-white transition-colors"
            >
              Browse Clubs
            </Link>
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
              className="hidden md:inline-flex px-4 py-2 text-white/90 text-sm font-medium hover:text-white transition-colors"
            >
              Log in
            </Link>

            <Link
              href="/signup"
              className="hidden md:inline-flex px-5 py-2 rounded-full bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </header>

        {mobileMenuOpen && (
          <nav className="relative md:hidden -mt-1 mb-2 flex flex-col gap-1 rounded-[14px] border border-white/15 bg-white/5 p-2">
            <Link
              href="/browse"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-[10px] px-3 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-white"
            >
              Browse Clubs
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-[10px] px-3 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-white"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-[10px] px-3 py-2 text-sm font-medium text-orange-400 hover:bg-white/10"
            >
              Sign Up
            </Link>
          </nav>
        )}
      </div>
    </div>
  );
}
