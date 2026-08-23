"use client";

import useSWR from "swr";
import { useEffect } from "react";
import { useSocket } from "@/components/providers";

export const fetcher = (url: string) =>
  fetch(url).then(async (res) => {
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ? JSON.stringify(body.error) : "Request failed");
    }
    return res.json();
  });

export function useNotifications() {
  const { data, error, isLoading, mutate } = useSWR("/api/notifications", fetcher, { refreshInterval: 60000 });
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    const onNew = () => mutate();
    socket.on("notification:new", onNew);
    return () => {
      socket.off("notification:new", onNew);
    };
  }, [socket, mutate]);

  return {
    notifications: data?.notifications ?? [],
    unreadCount: data?.unreadCount ?? 0,
    isLoading,
    error,
    mutate,
  };
}

export function useConversations() {
  const { data, error, isLoading, mutate } = useSWR("/api/conversations", fetcher);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    const onUpdate = () => mutate();
    socket.on("conversation:updated", onUpdate);
    return () => {
      socket.off("conversation:updated", onUpdate);
    };
  }, [socket, mutate]);

  return { conversations: data?.conversations ?? [], isLoading, error, mutate };
}

export function usePresence(onUpdate: (userId: string, isOnline: boolean) => void) {
  const { socket } = useSocket();
  useEffect(() => {
    if (!socket) return;
    const handler = ({ userId, isOnline }: { userId: string; isOnline: boolean }) => onUpdate(userId, isOnline);
    socket.on("presence:update", handler);
    return () => {
      socket.off("presence:update", handler);
    };
  }, [socket, onUpdate]);
}