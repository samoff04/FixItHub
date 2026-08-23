"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Card, Input, Button } from "@/components/ui";
import { useToast } from "@/components/providers";

export default function RegisterPage() {
  const router = useRouter();
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
      router.push("/dashboard");
    } catch (e: any) {
      push(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="w-[380px]">
          <div className="mb-6 flex items-center gap-2">
            <Sparkles className="text-accent" size={20} />
            <p className="font-display text-lg font-semibold">Create your account</p>
          </div>
          <form onSubmit={submit} className="space-y-3">
            <Input placeholder="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Username" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            <Input type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input
              type="password"
              placeholder="Password (min 8 chars)"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Button type="submit" className="w-full" loading={loading}>
              Create account
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}