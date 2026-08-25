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

export default function RegisterPage() {
  const { push } = useToast();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(typeof body.error === "string" ? body.error : "Registration failed");

      const signInRes = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      if (signInRes?.error) throw new Error("Account created — please sign in");

      push("Account created!", "success");
      window.location.href = "/dashboard";
    } catch (e: any) {
      setLoading(false);
      push(e.message, "error");
    }
  }

  return (
    <div className="-mt-8 grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-white/5 bg-surface p-10 lg:flex">
        <div className="pointer-events-none absolute -top-32 -left-20 h-[420px] w-[420px] rounded-full bg-accent/20 blur-[120px] animate-aurora" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-primary/25 blur-[110px] animate-aurora" style={{ animationDelay: "4s" }} />

        <Link href="/" className="relative z-10 flex items-center gap-2.5 font-display text-lg font-semibold">
          <span className="relative flex h-8 w-8 items-center justify-center">
            <Image src="/logo.png" alt="FixitHub" width={32} height={32} className="rounded-lg" priority />
          </span>
          <span className="gradient-text">FixitHub</span>
        </Link>

        <div className="relative z-10">
          <p className="font-display max-w-sm text-3xl font-semibold leading-snug text-white">
            Stop building alone. Find your team today.
          </p>
          <div className="mt-8 max-w-sm opacity-90">
            <ConnectionField className="w-full h-auto" />
          </div>
          <div className="mt-6 space-y-3">
            {[
              { icon: Radar, text: "Discover teammates ranked by real match score" },
              { icon: Users2, text: "Open a team and fill missing roles fast" },
              { icon: MessagesSquare, text: "Chat and coordinate in real time" },
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
          <h1 className="font-display text-2xl font-semibold text-white">Create your account</h1>
          <p className="mt-1 text-sm text-gray-500">Takes less than a minute.</p>

          <form onSubmit={submit} className="mt-6 space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400">Full name</label>
              <Input
                placeholder="Jordan Lee"
                required
                disabled={loading}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400">Username</label>
              <Input
                placeholder="jordanlee"
                required
                disabled={loading}
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
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
                placeholder="Min. 8 characters"
                required
                disabled={loading}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full" loading={loading}>
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}