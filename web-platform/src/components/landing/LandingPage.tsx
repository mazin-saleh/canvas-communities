"use client";

import Image from "next/image";
import Link from "next/link";
import PublicHeader from "@/components/public/PublicHeader";

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-y-auto bg-background text-slate-50">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <PublicHeader />

        {/* Hero card */}
        <main className="pb-12 sm:pb-16 lg:pb-20">
          <section className="min-h-[clamp(28rem,58vh,40rem)] overflow-hidden bg-[url('/landingbackground.png')] bg-cover bg-center bg-no-repeat text-slate-900 rounded-3xl ring-1 ring-black/5 shadow-sm px-6 sm:px-10">
            <div className="flex min-h-[inherit] flex-col justify-center py-10 sm:py-12 lg:py-14">
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/35 bg-white/10 px-4 py-2 backdrop-blur-sm w-fit">
                <Image
                  src="/Frame.svg"
                  alt="Canvas Communities logo"
                  width={26}
                  height={26}
                  priority
                  className="h-[26px] w-[26px]"
                />
                <span className="text-sm font-semibold text-white">
                  Canvas Communities
                </span>
              </div>

              <h1 className="max-w-3xl text-3xl sm:text-4xl lg:text-6xl font-semibold tracking-tight leading-tight">
                <span className="text-white font-bold">Discover </span>
                <span className="text-indigo-800 font-bold">Communities</span>
                <br />
                <span className="text-white font-bold">Get </span>
                <span className="text-indigo-800 font-bold">Involved</span>
                <br />
                <span className="text-white font-bold">Stay </span>
                <span className="text-indigo-800 font-bold">Connected.</span>
              </h1>

              <p className="mt-5 max-w-2xl text-base text-slate-100 sm:text-lg">
                Find student orgs, see what’s happening on campus, and build
                your circle-fast.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="px-14 py-3.5 bg-indigo-800 rounded-[20px] text-center text-white text-base font-semibold leading-6 tracking-wide hover:bg-indigo-900 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-amber-50"
                >
                  Explore Page
                </Link>
                <Link
                  href="/login"
                  className="px-14 py-3.5 bg-indigo-800 rounded-[20px] text-center text-white text-base font-semibold leading-6 tracking-wide hover:bg-indigo-900 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-amber-50"
                >
                  UFL Login
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
