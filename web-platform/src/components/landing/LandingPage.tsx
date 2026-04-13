"use client";

import Image from "next/image";
import Link from "next/link";
import { Compass, CalendarDays, Users } from "lucide-react";
import PublicHeader from "@/components/public/PublicHeader";

const features = [
  {
    icon: Compass,
    title: "Personalized Recommendations",
    description:
      "Tell us your interests and we'll match you with clubs and organizations that fit.",
  },
  {
    icon: CalendarDays,
    title: "Events at a Glance",
    description:
      "See upcoming meetings, socials, and events across every club in one place.",
  },
  {
    icon: Users,
    title: "Your Campus, Connected",
    description:
      "Join communities, follow what's happening, and stay in the loop with the orgs you care about.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-y-auto bg-background text-slate-50">
      <PublicHeader />

      {/* Hero — full bleed */}
      <main>
        <section className="relative min-h-[clamp(32rem,70vh,48rem)] overflow-hidden">
          <Image
            src="/landingbackground.png"
            alt=""
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />

          <div className="relative mx-auto flex min-h-[inherit] w-full max-w-6xl flex-col justify-center px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
            <div className="mb-6 inline-flex w-fit items-center gap-3 rounded-full border border-white/35 bg-white/10 px-4 py-2 backdrop-blur-sm">
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

            <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-6xl">
              <span className="text-white">Discover </span>
              <span className="text-indigo-300">Communities</span>
              <br />
              <span className="text-white">Get </span>
              <span className="text-indigo-300">Involved</span>
              <br />
              <span className="text-white">Stay </span>
              <span className="text-indigo-300">Connected.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base text-slate-200 sm:text-lg">
              Find student orgs, see what&apos;s happening on campus, and
              build your circle.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-full bg-orange-500 px-8 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-black/50 sm:text-base"
              >
                Get Started
              </Link>
              <Link
                href="/browse"
                className="rounded-full border border-white/30 px-8 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black/50 sm:text-base"
              >
                Browse Clubs
              </Link>
            </div>
          </div>
        </section>
      </main>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Feature Highlights */}
        <section className="py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl bg-white p-8 shadow-sm"
              >
                <feature.icon
                  className="h-8 w-8 text-indigo-800"
                  strokeWidth={1.5}
                />
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="pb-20 pt-4 text-center sm:pb-28">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">
            Ready to find your community?
          </h2>
          <div className="mt-8">
            <Link
              href="/signup"
              className="inline-block rounded-full bg-orange-500 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-background sm:text-base"
            >
              Get Started
            </Link>
          </div>
          <Link
            href="/browse"
            className="mt-4 inline-block text-sm text-white/70 transition-colors hover:text-white/90"
          >
            or browse clubs first
          </Link>
        </section>
      </div>
    </div>
  );
}
