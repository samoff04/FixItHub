"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Radar, Users2, MessagesSquare } from "lucide-react";
import { Input, Button } from "@/components/ui";
import { useToast } from "@/components/providers";
import { ConnectionField } from "@/components/connection-field";

export default function LoginPage() {
  const { push } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { ...form, redirect: false });
    if (res?.error) {
      setLoading(false);
      push("Invalid email or password", "error");
    } else {
      push("Welcome back!", "success");
      window.location.href = "/dashboard";
    }
  }

  return (
    <div className="-mt-8 grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-white/5 bg-surface p-10 lg:flex">
        <div className="pointer-events-none absolute -top-32 -left-20 h-[420px] w-[420px] rounded-full bg-primary/25 blur-[120px] animate-aurora" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-accent/20 blur-[110px] animate-aurora" style={{ animationDelay: "4s" }} />

        <Link href="/" className="relative z-10 flex items-center gap-2.5 font-display text-lg font-semibold">
          <span className="relative flex h-8 w-8 items-center justify-center">
            <Image src="/logo.png" alt="FixitHub" width={32} height={32} className="rounded-lg" priority />
          </span>
          <span className="gradient-text">FixitHub</span>
        </Link>

        <div className="relative z-10">
          <p className="font-display max-w-sm text-3xl font-semibold leading-snug text-white">
            Every great project starts with the right people.
          </p>
          <div className="mt-8 max-w-sm opacity-90">
            <ConnectionField className="w-full h-auto" />
          </div>
          <div className="mt-6 space-y-3">
            {[
              { icon: Radar, text: "Matched by skill, role, and goal" },
              { icon: Users2, text: "Form and manage teams in minutes" },
              { icon: MessagesSquare, text: "Realtime chat the moment you connect" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3 text-sm text-gray-400">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-accent">
                  <f.icon size={15} />
                </span>
                {f.text}
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-gray-600">© {new Date().getFullYear()} FixitHub</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="mb-2 flex items-center gap-2.5 lg:hidden">
            <Image src="/logo.png" alt="FixitHub" width={28} height={28} className="rounded-lg" priority />
            <span className="font-display font-semibold gradient-text">FixitHub</span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to keep building with your team.</p>

          <form onSubmit={submit} className="mt-6 space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400">Email</label>
              <Input
                type="email"
                placeholder="you@college.edu"
                required
                disabled={loading}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                required
                disabled={loading}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full" loading={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            No account?{" "}
            <Link href="/register" className="text-accent hover:underline">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}