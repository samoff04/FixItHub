"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function PublicNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-base/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-semibold">
          <span className="relative flex h-8 w-8 items-center justify-center">
            <Image src="/logo.png" alt="FixitHub" width={32} height={32} className="rounded-lg" priority />
            <span className="absolute inset-0 -z-10 rounded-lg bg-primary/40 blur-md animate-pulseGlow" />
          </span>
          <span className="gradient-text">FixitHub</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:text-white",
              pathname === "/login" && "text-white"
            )}
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="glow-ring rounded-lg bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-medium text-white shadow-glow transition-all hover:shadow-glow-lg"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}