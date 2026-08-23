"use client";

import { Bell, Trash2 } from "lucide-react";
import { useNotifications } from "@/hooks/client-hooks";
import { Card, EmptyState, SkeletonBlock, Button } from "@/components/ui";
import { timeAgo, cn } from "@/lib/utils";

export default function NotificationsPage() {
  const { notifications, isLoading, mutate } = useNotifications();

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    mutate();
  }
  async function remove(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    mutate();
  }
  async function markAll() {
    await fetch("/api/notifications", { method: "PATCH" });
    mutate();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-white">Notifications</h1>
        <Button variant="secondary" onClick={markAll}>
          Mark all read
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-16" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" />
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any) => (
            <Card key={n.id} onClick={() => markRead(n.id)} className={cn("flex cursor-pointer items-start justify-between gap-3", !n.isRead && "border-primary/30")}>
              <div>
                <p className="text-sm text-gray-200">{n.title}</p>
                <p className="text-sm text-gray-500">{n.body}</p>
                <p className="mt-1 text-xs text-gray-600">{timeAgo(n.createdAt)}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  remove(n.id);
                }}
                className="text-gray-600 hover:text-rose-400"
                aria-label="Delete notification"
              >
                <Trash2 size={14} />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}