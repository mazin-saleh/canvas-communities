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

              <form onSubmit={handleSignup} className="mt-5 space-y-3.5">
                <div>
                  <label className="text-[11px] font-normal text-white/85 block mb-1.5">
                    Username
                  </label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="h-[32px] sm:h-[34px] rounded-[5px] border border-[#c8c8c8] bg-white px-2 text-[11px] text-slate-900 placeholder:text-[#636363] focus:ring-2 focus:ring-[#354a9c]/40"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-normal text-white/85 block mb-1.5">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-[32px] sm:h-[34px] rounded-[5px] border border-[#c8c8c8] bg-white px-2 text-[11px] text-slate-900 placeholder:text-[#636363] focus:ring-2 focus:ring-[#354a9c]/40"
                  />
                </div>

                {error && <p className="text-sm text-red-300">{error}</p>}

                <div className="pt-1.5 space-y-2.5">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[32px] sm:h-[34px] rounded-[5px] bg-[#354a9c] hover:bg-[#2e448b] text-white text-[11px] font-medium"
                  >
                    {loading ? "Creating..." : "Create account"}
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    className="w-full text-[11px] text-white/90 hover:text-white"
                    onClick={() => router.push("/login")}
                  >
                    Already have an account?
                  </Button>
                </div>
              </form>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
