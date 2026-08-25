"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  User,
  Settings,
  Users,
  Bookmark,
  HelpCircle,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Avatar } from "./ui";

const items = [
  { href: "/profile/me", label: "View profile", icon: User },
  { href: "/teams", label: "My teams", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/discover?saved=true", label: "Saved matches", icon: Bookmark },
];

export function AccountMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!session) return null;

  const name = session.user?.name ?? "Account";
  const username = (session.user as { username?: string })?.username;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="focus-ring flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-white/5"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar name={name} src={session.user?.image} size={32} />

        <ChevronDown
          size={14}
          className={`text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            role="menu"
            className="glass absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl p-1.5 shadow-glow-lg"
          >
            <div className="flex items-center gap-3 rounded-xl px-3 py-3">
              <Avatar name={name} src={session.user?.image} size={38} />

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-100">
                  {name}
                </p>

                {username && (
                  <p className="truncate text-xs text-gray-500">
                    @{username}
                  </p>
                )}
              </div>
            </div>

            <div className="my-1 h-px bg-white/5" />

            <div className="py-1">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  role="menuitem"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <item.icon size={16} className="text-gray-500" />
                  {item.label}
                </Link>
              ))}

              <a
                href="mailto:support@fixithub.dev"
                role="menuitem"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                <HelpCircle size={16} className="text-gray-500" />
                Help & support
              </a>
            </div>

            <div className="my-1 h-px bg-white/5" />

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              role="menuitem"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-rose-400 transition-colors hover:bg-rose-500/10"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}