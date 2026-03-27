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

                  <form onSubmit={handleLogin} className="mt-5">
                    <div>
                      <label
                        htmlFor="login-email"
                        className="mb-2 block text-base font-semibold text-white"
                      >
                        Email
                      </label>
                      <Input
                        id="login-email"
                        placeholder="Email"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="h-[44px] rounded-[5px] border border-[#c8c8c8] bg-white px-3 text-base text-slate-900 placeholder:text-[#636363] focus:ring-2 focus:ring-[#354a9c]/40"
                      />
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor="login-password"
                        className="mb-2 block text-base font-semibold text-white"
                      >
                        Password
                      </label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-[44px] rounded-[5px] border border-[#c8c8c8] bg-white px-3 text-base text-slate-900 placeholder:text-[#636363] focus:ring-2 focus:ring-[#354a9c]/40"
                      />
                    </div>

                    <div className="mt-6 flex items-center justify-between text-base text-white/90">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="size-4 rounded-[2px] border border-[#636363] accent-[#354a9c]"
                        />
                        <span>Remember Me</span>
                      </label>
                      <button
                        type="button"
                        className="-mr-2 px-2 py-2 text-base underline underline-offset-2 hover:text-white"
                      >
                        Forgot your password?
                      </button>
                    </div>

                    {error && <p className="text-sm text-red-300">{error}</p>}

                    <Button
                      className="mt-8 w-full h-[44px] rounded-[5px] bg-[#354a9c] hover:bg-[#2e448b] text-white text-base font-medium"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Signing in..." : "Login"}
                    </Button>

                    <div className="mt-4 flex items-center gap-2 py-0.5">
                      <div className="h-px flex-1 bg-white/30" />
                      <span className="text-[10px] text-white/90">
                        Or Login With
                      </span>
                      <div className="h-px flex-1 bg-white/30" />
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2">
                      <button
                        type="button"
                        className="h-[34px] rounded-[4px] border border-[#636363] bg-[#f0f0f0] text-[12px] text-black"
                      >
                        Google
                      </button>
                    </div>

                    <div className="text-center pt-1">
                      <Button
                        variant="link"
                        className="w-full px-2 py-2 text-base text-white/90 hover:text-white"
                        onClick={() => router.push("/signup")}
                      >
                        Don&apos;t have an account? Register now.
                      </Button>
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
