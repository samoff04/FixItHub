"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useNotifications } from "@/hooks/client-hooks";
import { timeAgo } from "@/lib/utils";
import { EmptyState } from "./ui";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, mutate } = useNotifications();

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    mutate();
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="relative text-gray-400 hover:text-gray-200" aria-label="Notifications">
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              className="glass absolute right-0 z-50 mt-3 max-h-96 w-80 overflow-y-auto rounded-2xl p-2 shadow-glow"
            >
              <div className="flex items-center justify-between px-2 py-1">
                <p className="text-sm font-medium text-gray-200">Notifications</p>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-accent hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">You&apos;re all caught up</div>
              ) : (
                notifications.map((n: any) => (
                  <Link
                    key={n.id}
                    href={n.link ?? "#"}
                    onClick={() => setOpen(false)}
                    className={`block rounded-xl px-3 py-2 text-sm transition-colors hover:bg-white/5 ${!n.isRead ? "bg-white/[0.03]" : ""}`}
                  >
                    <p className="text-gray-200">{n.title}</p>
                    <p className="text-xs text-gray-500">{n.body}</p>
                    <p className="mt-1 text-[10px] text-gray-600">{timeAgo(n.createdAt)}</p>
                  </Link>
                ))
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}