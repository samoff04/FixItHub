"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Card, Input, Button } from "@/components/ui";
import { useToast } from "@/components/providers";

export default function LoginPage() {
  const router = useRouter();
  const { push } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { ...form, redirect: false });
    setLoading(false);
    if (res?.error) {
      push("Invalid email or password", "error");
    } else {
      push("Welcome back!", "success");
      router.push("/dashboard");
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="w-[380px]">
          <div className="mb-6 flex items-center gap-2">
            <Sparkles className="text-accent" size={20} />
            <p className="font-display text-lg font-semibold">Sign in to FixitHub</p>
          </div>
          <form onSubmit={submit} className="space-y-3">
            <Input type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input
              type="password"
              placeholder="Password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Button type="submit" className="w-full" loading={loading}>
              Sign in
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            No account?{" "}
            <Link href="/register" className="text-accent hover:underline">
              Register
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}