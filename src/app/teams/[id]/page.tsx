"use client";

import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Users, MessageCircle, LogOut, UserMinus } from "lucide-react";
import { fetcher } from "@/hooks/client-hooks";
import { Card, Avatar, Badge, Button, SkeletonBlock, ErrorState } from "@/components/ui";
import { useToast } from "@/components/providers";

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const router = useRouter();
  const { push } = useToast();
  const { data, error, isLoading, mutate } = useSWR(`/api/teams/${id}`, fetcher);

  if (isLoading) return <SkeletonBlock className="h-96" />;
  if (error) return <ErrorState onRetry={() => mutate()} />;
  const team = data.team;
  const meId = (session?.user as any)?.id;
  const isMember = team.members.some((m: any) => m.userId === meId);
  const isLeader = team.leaderId === meId;

  async function join() {
    const res = await fetch(`/api/teams/${id}/members`, { method: "POST" });
    const body = await res.json();
    if (res.ok) {
      push("Joined the team!", "success");
      mutate();
    } else push(body.error ?? "Could not join", "error");
  }

  async function leave() {
    await fetch(`/api/teams/${id}/members/${meId}`, { method: "DELETE" });
    push("Left the team", "info");
    mutate();
  }

  async function removeMember(userId: string) {
    await fetch(`/api/teams/${id}/members/${userId}`, { method: "DELETE" });
    mutate();
  }

  async function openChat() {
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId: id }),
    });
    const body = await res.json();
    if (res.ok) router.push(`/messages?c=${body.conversation.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-display text-2xl font-semibold text-white">{team.name}</p>
            {team.event && <Badge className="mt-2">{team.event.title}</Badge>}
          </div>
          <Badge className={team.isOpen ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : ""}>
            {team.isOpen ? "Open" : "Closed"}
          </Badge>
        </div>
        <p className="text-sm text-gray-300">{team.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {team.lookingForRoles.map((r: string) => (
            <Badge key={r}>{r}</Badge>
          ))}
        </div>
        <div className="flex gap-2">
          {isMember ? (
            <>
              <Button onClick={openChat}>
                <MessageCircle size={14} /> Team chat
              </Button>
              {!isLeader && (
                <Button variant="secondary" onClick={leave}>
                  <LogOut size={14} /> Leave team
                </Button>
              )}
            </>
          ) : (
            team.isOpen && (
              <Button onClick={join} disabled={team.members.length >= team.maxMembers}>
                <Users size={14} /> Join team
              </Button>
            )
          )}
        </div>
      </Card>

      <Card>
        <p className="mb-3 text-sm font-medium text-gray-200">
          Members ({team.members.length}/{team.maxMembers})
        </p>
        <div className="space-y-2">
          {team.members.map((m: any) => (
            <div key={m.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={m.user.name} src={m.user.avatarUrl} size={32} online={m.user.isOnline} />
                <div>
                  <p className="text-sm text-gray-200">{m.user.name}</p>
                  <p className="text-xs text-gray-500">{m.role === "LEADER" ? "Leader" : "Member"}</p>
                </div>
              </div>
              {isLeader && m.role !== "LEADER" && (
                <button onClick={() => removeMember(m.userId)} className="text-gray-500 hover:text-rose-400" aria-label="Remove member">
                  <UserMinus size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}