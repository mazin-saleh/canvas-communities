"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { api } from "@/lib/api";
import PublicHeader from "@/components/public/PublicHeader";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e?: React.FormEvent) {
    e?.preventDefault();
    if (!username.trim()) return;
    setError("");
    setLoading(true);

    try {
      // Find user by username from the DB
      const users = await api.user.getAll();
      const user = users.find(
        (u) => u.username.toLowerCase() === username.trim().toLowerCase(),
      );

      if (!user) {
        setError("User not found. Try a username like alice, bob, or carol.");
        setLoading(false);
        return;
      }

      login({ id: String(user.id), name: user.username });
      router.push("/onboarding/personalize");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh overflow-y-auto bg-[#0f2066] text-white">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col px-4 sm:px-5 lg:px-8">
        <PublicHeader />

        <main className="flex flex-1 items-start pb-10 sm:pb-14 lg:pb-16">
          <section className="w-full pt-5 sm:pt-8 lg:pt-10">
            <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-[60px]">
              <div className="relative hidden lg:flex lg:min-h-[590px] lg:flex-1 rounded-[60px] bg-[#f9510e] overflow-hidden">
                <Image
                  src="/landingbackground.png"
                  alt=""
                  fill
                  className="object-cover opacity-10"
                />
                <div className="relative z-10 flex items-center px-8 py-10 sm:px-10 lg:px-14 lg:py-12 xl:px-16">
                  <h1 className="max-w-[520px] text-[28px] sm:text-[34px] lg:text-[52px] leading-[1.08] font-bold tracking-tight text-white">
                    Discover, join, and{" "}
                    <span className="text-[#2e448b]">engage</span> with every
                    student organization all in{" "}
                    <span className="text-[#354a9c]">one place.</span>
                  </h1>
                </div>
              </div>

              <div className="mx-auto flex w-full max-w-[560px] flex-col justify-center lg:mx-0 lg:max-w-none lg:flex-1 lg:px-6 xl:px-12">
                <div className="w-full max-w-[500px] md:max-w-[560px] lg:max-w-[500px]">
                  <h2 className="text-[42px] sm:text-[48px] lg:text-[54px] leading-[1.02] font-semibold tracking-tight text-white">
                    Welcome Back
                  </h2>
                  <p className="mt-1.5 text-[11px] sm:text-xs text-white/80 leading-5">
                    Enter your email and password to access your clubs
                  </p>

                  <form onSubmit={handleLogin} className="mt-6">
                    <div>
                      <label
                        htmlFor="login-email"
                        className="mb-1.5 block text-sm font-medium text-white/90"
                      >
                        Username
                      </label>
                      <Input
                        id="login-email"
                        placeholder="e.g. alice"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="h-11 rounded-md border border-white/20 bg-white/10 px-3 text-sm text-white placeholder:text-white/40 focus:border-white/50 focus:bg-white/15 focus:ring-2 focus:ring-white/20 transition-colors"
                      />
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor="login-password"
                        className="mb-1.5 block text-sm font-medium text-white/90"
                      >
                        Password
                      </label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 rounded-md border border-white/20 bg-white/10 px-3 text-sm text-white placeholder:text-white/40 focus:border-white/50 focus:bg-white/15 focus:ring-2 focus:ring-white/20 transition-colors"
                      />
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm text-white/80">
                      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="size-4 rounded border border-white/30 accent-[#354a9c]"
                        />
                        <span>Remember me</span>
                      </label>
                      <button
                        type="button"
                        className="text-sm text-white/70 hover:text-white underline underline-offset-2 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>

                    {error && (
                      <p className="mt-3 rounded-md bg-red-500/20 px-3 py-2 text-sm text-red-300 border border-red-500/30">
                        {error}
                      </p>
                    )}

                    <Button
                      className="mt-6 w-full h-11 rounded-md bg-[#354a9c] hover:bg-[#2e448b] active:bg-[#283d7a] text-white text-sm font-semibold transition-colors"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Signing in…" : "Sign in"}
                    </Button>

                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-px flex-1 bg-white/20" />
                      <span className="text-xs text-white/50">or continue with</span>
                      <div className="h-px flex-1 bg-white/20" />
                    </div>

                    <button
                      type="button"
                      className="mt-3 w-full h-11 rounded-md border border-white/20 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Google
                    </button>

                    <div className="mt-5 text-center">
                      <button
                        type="button"
                        onClick={() => router.push("/signup")}
                        className="text-sm text-white/70 hover:text-white transition-colors"
                      >
                        Don&apos;t have an account?{" "}
                        <span className="font-semibold text-white underline underline-offset-2">
                          Sign up
                        </span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
