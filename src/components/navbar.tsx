"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Compass, Users, CalendarDays, MessageSquare, LayoutDashboard } from "lucide-react";
import { NotificationBell } from "./notification-bell";
import { AccountMenu } from "./account-menu";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/messages", label: "Messages", icon: MessageSquare },
];

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  if (!session) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-base/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-display text-lg font-semibold">
          <Image src="/logo.png" alt="FixitHub" width={32} height={32} className="rounded-lg" priority />
          <span className="gradient-text hidden sm:inline">FixitHub</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {links.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  active ? "text-white" : "text-gray-400 hover:text-gray-200"
                )}
              >
                <l.icon size={16} />
                {l.label}
                {active && (
                  <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-lg bg-white/8" transition={{ type: "spring", duration: 0.4 }} />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <NotificationBell />
          <span className="h-6 w-px bg-white/10" />
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}