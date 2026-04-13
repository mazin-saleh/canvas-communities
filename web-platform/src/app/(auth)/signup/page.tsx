"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Input from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { api } from "@/lib/api";
import PublicHeader from "@/components/public/PublicHeader";

export default function Signup() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e?: React.FormEvent) {
    e?.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setError("");
    setLoading(true);

    try {
      const user = await api.user.create(username.trim(), password);
      login({ id: String(user.id), name: user.username });
      router.push("/onboarding/personalize");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Signup failed. Username may already be taken.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh overflow-y-auto bg-[#0f2066] text-white">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col px-4 sm:px-5 lg:px-8">
        <PublicHeader />

        <main className="flex flex-1 items-start justify-center pb-10 sm:pb-14 lg:pb-16">
          <section className="mx-auto flex w-full max-w-[500px] flex-col px-1 pt-5 sm:px-2 sm:pt-8 lg:pt-10">
            <div className="w-full">
              <h2 className="text-[clamp(2.2rem,3.7vw,3.5rem)] font-semibold tracking-tight text-white leading-[1.02]">
                Create account
              </h2>
              <p className="mt-1.5 text-[11px] sm:text-xs text-white/80 leading-5">
                Enter your username and password to start discovering clubs.
              </p>

              <form onSubmit={handleSignup} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-white/90">
                    Username
                  </label>
                  <Input
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="h-11 rounded-md border border-white/20 bg-white/10 px-3 text-sm text-white placeholder:text-white/40 focus:border-white/50 focus:bg-white/15 focus:ring-2 focus:ring-white/20 transition-colors"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-white/90">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 rounded-md border border-white/20 bg-white/10 px-3 text-sm text-white placeholder:text-white/40 focus:border-white/50 focus:bg-white/15 focus:ring-2 focus:ring-white/20 transition-colors"
                  />
                </div>

                {error && (
                  <p className="rounded-md bg-red-500/20 px-3 py-2 text-sm text-red-300 border border-red-500/30">
                    {error}
                  </p>
                )}

                <div className="pt-1 space-y-3">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-md bg-[#354a9c] hover:bg-[#2e448b] active:bg-[#283d7a] text-white text-sm font-semibold transition-colors"
                  >
                    {loading ? "Creating account…" : "Create account"}
                  </Button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => router.push("/login")}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      Already have an account?{" "}
                      <span className="font-semibold text-white underline underline-offset-2">
                        Sign in
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
