"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Compass,
  Users,
  CalendarDays,
  MessageSquare,
  LayoutDashboard,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";

import { Avatar } from "./ui";
import { NotificationBell } from "./notification-bell";
import { cn } from "@/lib/utils";

const links = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/discover",
    label: "Discover",
    icon: Compass,
  },
  {
    href: "/teams",
    label: "Teams",
    icon: Users,
  },
  {
    href: "/events",
    label: "Events",
    icon: CalendarDays,
  },
  {
    href: "/messages",
    label: "Messages",
    icon: MessageSquare,
  },
];

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "loading" || !session) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-base/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex shrink-0 items-center gap-2 font-display text-lg font-semibold"
          aria-label="FixitHub Dashboard"
        >
          <Sparkles
            className="text-accent"
            size={20}
            aria-hidden="true"
          />
          <span className="gradient-text">FixitHub</span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden flex-1 items-center gap-1 md:flex"
          aria-label="Main navigation"
        >
          {links.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  "focus-ring",
                  active
                    ? "text-white"
                    : "text-gray-400 hover:text-gray-200"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={16} aria-hidden="true" />
                <span>{label}</span>

                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-lg bg-white/8"
                    transition={{
                      type: "spring",
                      duration: 0.4,
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-3">
          <NotificationBell />

          <Link
            href="/settings"
            className="focus-ring text-gray-400 transition-colors hover:text-gray-200"
            aria-label="Settings"
          >
            <Settings size={18} aria-hidden="true" />
          </Link>

          <Link
            href="/profile/me"
            className="focus-ring flex items-center gap-2 rounded-full"
            aria-label={`View ${session.user?.name ?? "your"} profile`}
          >
            <Avatar
              name={session.user?.name ?? "U"}
              src={session.user?.image}
              size={32}
            />
          </Link>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="focus-ring text-gray-500 transition-colors hover:text-rose-400"
            aria-label="Sign out"
          >
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}