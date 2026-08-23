"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Pencil, MessageCircle, Flag, Save, X, Plus } from "lucide-react";
import { fetcher } from "@/hooks/client-hooks";
import { Card, Avatar, Badge, Button, Input, Textarea, SkeletonBlock, ErrorState } from "@/components/ui";
import { useToast } from "@/components/providers";

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const { push } = useToast();
  const { data, error, isLoading, mutate } = useSWR(`/api/profile/${id}`, fetcher);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>(null);
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");

  useEffect(() => {
    if (data?.user) {
      setForm({
        name: data.user.name,
        bio: data.user.bio ?? "",
        college: data.user.college ?? "",
        roles: data.user.roles ?? [],
        goals: data.user.goals ?? [],
        skills: data.user.skills.map((s: any) => ({ name: s.skill.name, level: s.level })),
      });
    }
  }, [data]);

  if (isLoading || !form) return <SkeletonBlock className="h-96" />;
  if (error) return <ErrorState onRetry={() => mutate()} />;
  const user = data.user;
  const isSelf = user.isSelf;

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/profile/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Could not save");
      push("Profile updated", "success");
      setEditing(false);
      mutate();
    } catch (e: any) {
      push(e.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function startConversation() {
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: user.id }),
    });
    const body = await res.json();
    if (res.ok) router.push(`/messages?c=${body.conversation.id}`);
    else push(body.error ?? "Could not start conversation", "error");
  }

  async function submitReport() {
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportedUserId: user.id, reason: reportReason }),
    });
    if (res.ok) {
      push("Report submitted", "success");
      setReporting(false);
      setReportReason("");
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Avatar name={user.name} src={user.avatarUrl} size={80} online={user.isOnline} />
        <div className="flex-1">
          {editing ? (
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mb-2" />
          ) : (
            <p className="font-display text-2xl font-semibold text-white">{user.name}</p>
          )}
          <p className="text-sm text-gray-500">@{user.username}</p>
          {editing ? (
            <Textarea className="mt-3" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          ) : (
            <p className="mt-3 text-sm text-gray-300">{user.bio || "No bio yet."}</p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          {isSelf ? (
            editing ? (
              <>
                <Button loading={saving} onClick={save}>
                  <Save size={14} /> Save
                </Button>
                <Button variant="secondary" onClick={() => setEditing(false)}>
                  <X size={14} />
                </Button>
              </>
            ) : (
              <Button variant="secondary" onClick={() => setEditing(true)}>
                <Pencil size={14} /> Edit
              </Button>
            )
          ) : (
            <>
              {user.connectionStatus === "connected" && (
                <Button onClick={startConversation}>
                  <MessageCircle size={14} /> Message
                </Button>
              )}
              <Button variant="danger" onClick={() => setReporting(true)}>
                <Flag size={14} />
              </Button>
            </>
          )}
        </div>
      </Card>

      {reporting && (
        <Card className="space-y-3">
          <p className="text-sm font-medium text-gray-200">Report {user.name}</p>
          <Input placeholder="Reason (e.g. harassment, spam)" value={reportReason} onChange={(e) => setReportReason(e.target.value)} />
          <div className="flex gap-2">
            <Button variant="danger" onClick={submitReport} disabled={!reportReason}>
              Submit report
            </Button>
            <Button variant="secondary" onClick={() => setReporting(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <Card>
        <p className="mb-3 text-sm font-medium text-gray-200">Skills</p>
        <div className="flex flex-wrap gap-2">
          {(editing ? form.skills : user.skills.map((s: any) => ({ name: s.skill.name, level: s.level }))).map((s: any, i: number) => (
            <Badge key={s.name + i} className="flex items-center gap-1">
              {s.name}
              {editing && (
                <button onClick={() => setForm({ ...form, skills: form.skills.filter((_: any, idx: number) => idx !== i) })}>
                  <X size={10} />
                </button>
              )}
            </Badge>
          ))}
        </div>
        {editing && (
          <div className="mt-3 flex gap-2">
            <Input placeholder="Add a skill…" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} />
            <Button
              variant="secondary"
              onClick={() => {
                if (!skillInput.trim()) return;
                setForm({ ...form, skills: [...form.skills, { name: skillInput.trim(), level: "intermediate" }] });
                setSkillInput("");
              }}
            >
              <Plus size={14} />
            </Button>
          </div>
        )}
      </Card>

      <Card>
        <p className="mb-3 text-sm font-medium text-gray-200">Goals & roles</p>
        <div className="flex flex-wrap gap-2">
          {user.goals.map((g: string) => (
            <Badge key={g} className="border-accent/30 bg-accent/10 text-accent">
              {g}
            </Badge>
          ))}
          {user.roles.map((r: string) => (
            <Badge key={r} className="border-primary/30 bg-primary/10 text-primary-light">
              {r}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}