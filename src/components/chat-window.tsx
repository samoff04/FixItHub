"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "./providers";
import { Avatar, Button, Input } from "./ui";
import { timeAgo } from "@/lib/utils";

type Msg = { id: string; content: string; senderId: string; createdAt: string; sender: { name: string; avatarUrl: string | null } };

export function ChatWindow({ conversationId }: { conversationId: string }) {
  const { data: session } = useSession();
  const { socket } = useSocket();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [typingUser, setTypingUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const meId = (session?.user as any)?.id;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/conversations/${conversationId}/messages`)
      .then((r) => r.json())
      .then((d) => setMessages(d.messages ?? []))
      .finally(() => setLoading(false));
  }, [conversationId]);

  useEffect(() => {
    if (!socket) return;
    socket.emit("conversation:join", conversationId);

    const onMessage = (msg: Msg) => {
      if (msg.senderId !== meId) {
        setMessages((prev) => [...prev, msg]);
      } else {
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      }
    };
    const onTyping = ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      if (userId !== meId) setTypingUser(isTyping);
    };

    socket.on("message:new", onMessage);
    socket.on("typing:update", onTyping);
    return () => {
      socket.emit("conversation:leave", conversationId);
      socket.off("message:new", onMessage);
      socket.off("typing:update", onTyping);
    };
  }, [socket, conversationId, meId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

  async function send() {
    if (!text.trim()) return;
    const content = text;
    setText("");
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const body = await res.json();
    if (res.ok) setMessages((prev) => [...prev, body.message]);
    socket?.emit("typing:stop", { conversationId });
  }

  let typingTimeout: ReturnType<typeof setTimeout>;
  function handleTyping(val: string) {
    setText(val);
    socket?.emit("typing:start", { conversationId });
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => socket?.emit("typing:stop", { conversationId }), 1500);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">Loading messages…</div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">Say hello 👋</div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((m) => {
              const mine = m.senderId === meId;
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}
                >
                  {!mine && <Avatar name={m.sender.name} src={m.sender.avatarUrl} size={24} />}
                  <div
                    className={`max-w-xs rounded-2xl px-4 py-2 text-sm md:max-w-md ${
                      mine ? "rounded-br-sm bg-gradient-to-r from-primary to-accent text-white" : "rounded-bl-sm bg-white/5 text-gray-200"
                    }`}
                  >
                    <p>{m.content}</p>
                    <p className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-gray-500"}`}>{timeAgo(m.createdAt)}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        {typingUser && <p className="pl-8 text-xs text-gray-500 animate-pulse">typing…</p>}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center gap-2 border-t border-white/5 p-3">
        <Input
          value={text}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message…"
        />
        <Button onClick={send} aria-label="Send message">
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}