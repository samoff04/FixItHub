"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { useConversations } from "@/hooks/client-hooks";
import { ChatWindow } from "@/components/chat-window";
import { Avatar, EmptyState, SkeletonBlock } from "@/components/ui";
import { useSession } from "next-auth/react";
import { timeAgo, cn } from "@/lib/utils";

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const { conversations, isLoading } = useConversations();
  const { data: session } = useSession();
  const meId = (session?.user as any)?.id;
  const [active, setActive] = useState<string | null>(searchParams.get("c"));

  const activeConversation = conversations.find((c: any) => c.id === active);

  return (
    <div className="glass grid h-[calc(100vh-9rem)] grid-cols-1 overflow-hidden rounded-2xl md:grid-cols-[320px_1fr]">
      <div className="border-b border-white/5 md:border-b-0 md:border-r overflow-y-auto">
        <div className="border-b border-white/5 p-4">
          <p className="font-display font-medium text-gray-200">Messages</p>
        </div>
        {isLoading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-16" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4">
            <EmptyState icon={MessageSquare} title="No conversations" description="Connect with someone to start chatting." />
          </div>
        ) : (
          conversations.map((c: any) => {
            const other = c.isGroup ? null : c.participants.find((p: any) => p.user.id !== meId)?.user;
            const name = c.isGroup ? c.name?.replace("team:", "Team ") ?? "Group" : other?.name ?? "Unknown";
            return (
              <button
                key={c.id}
                onClick={() => setActive(c.id)}
                className={cn(
                  "flex w-full items-center gap-3 border-b border-white/5 p-3 text-left transition-colors hover:bg-white/5",
                  active === c.id && "bg-white/8"
                )}
              >
                <Avatar name={name} src={other?.avatarUrl} online={other?.isOnline} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm text-gray-200">{name}</p>
                    {c.lastMessage && <span className="shrink-0 text-[10px] text-gray-500">{timeAgo(c.lastMessage.createdAt)}</span>}
                  </div>
                  <p className="truncate text-xs text-gray-500">{c.lastMessage?.content ?? "No messages yet"}</p>
                </div>
                {c.unreadCount > 0 && <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />}
              </button>
            );
          })
        )}
      </div>

      <div className="hidden md:block">
        {activeConversation ? (
          <ChatWindow conversationId={activeConversation.id} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <EmptyState icon={MessageSquare} title="Select a conversation" description="Choose a chat from the list to start messaging." />
          </div>
        )}
      </div>
    </div>
  );
}