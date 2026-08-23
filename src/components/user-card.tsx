"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus, Check, Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Card, Avatar, Badge, Button } from "./ui";
import { useToast } from "./providers";
import type { ApiUser } from "@/types";

export function UserCard({ user }: { user: ApiUser }) {
  const [status, setStatus] = useState(user.connectionStatus ?? "none");
  const [loading, setLoading] = useState(false);
  const { push } = useToast();

  async function connect() {
    setLoading(true);
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: user.id }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      setStatus("pending_sent");
      push(`Request sent to ${user.name}`, "success");
    } catch (e: any) {
      push(typeof e.message === "string" ? e.message : "Could not send request", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between">
          <Link href={`/profile/${user.id}`} className="flex items-center gap-3">
            <Avatar name={user.name} src={user.avatarUrl} online={user.isOnline} />
            <div>
              <p className="font-medium text-gray-100">{user.name}</p>
              <p className="text-xs text-gray-500">@{user.username}</p>
            </div>
          </Link>
          {typeof user.matchScore === "number" && (
            <Badge className="border-accent/30 bg-accent/10 text-accent">
              <Sparkles size={11} className="mr-1" /> {user.matchScore}
            </Badge>
          )}
        </div>

        {user.bio && <p className="line-clamp-2 text-sm text-gray-400">{user.bio}</p>}

        <div className="flex flex-wrap gap-1.5">
          {user.skills.slice(0, 4).map((s) => (
            <Badge key={s.id}>{s.skill.name}</Badge>
          ))}
        </div>

        <div className="mt-auto pt-2">
          {status === "connected" ? (
            <Button variant="secondary" disabled className="w-full">
              <Check size={14} /> Connected
            </Button>
          ) : status === "pending_sent" ? (
            <Button variant="secondary" disabled className="w-full">
              <Clock size={14} /> Pending
            </Button>
          ) : (
            <Button className="w-full" loading={loading} onClick={connect}>
              <UserPlus size={14} /> Connect
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}