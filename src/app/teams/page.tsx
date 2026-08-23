"use client";

import { useState } from "react";
import useSWR from "swr";
import { Plus, Users } from "lucide-react";
import { fetcher } from "@/hooks/client-hooks";
import { TeamCard } from "@/components/team-card";
import { Button, Card, Input, Textarea, EmptyState, SkeletonBlock, ErrorState } from "@/components/ui";
import { useToast } from "@/components/providers";

export default function TeamsPage() {
  const { data, error, isLoading, mutate } = useSWR("/api/teams", fetcher);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", maxMembers: 5, lookingForRoles: "" });
  const [saving, setSaving] = useState(false);
  const { push } = useToast();

  async function createTeam() {
    setSaving(true);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          maxMembers: Number(form.maxMembers),
          lookingForRoles: form.lookingForRoles.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(body.error));
      push("Team created!", "success");
      setCreating(false);
      setForm({ name: "", description: "", maxMembers: 5, lookingForRoles: "" });
      mutate();
    } catch (e: any) {
      push("Could not create team", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">Teams</h1>
          <p className="mt-1 text-sm text-gray-500">Browse open teams or start your own.</p>
        </div>
        <Button onClick={() => setCreating((c) => !c)}>
          <Plus size={14} /> New team
        </Button>
      </div>

      {creating && (
        <Card className="space-y-3">
          <Input placeholder="Team name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Textarea placeholder="What are you building?" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex gap-3">
            <Input
              type="number"
              min={2}
              max={12}
              placeholder="Max members"
              value={form.maxMembers}
              onChange={(e) => setForm({ ...form, maxMembers: Number(e.target.value) })}
            />
            <Input
              placeholder="Roles needed (comma separated)"
              value={form.lookingForRoles}
              onChange={(e) => setForm({ ...form, lookingForRoles: e.target.value })}
            />
          </div>
          <Button loading={saving} onClick={createTeam} disabled={!form.name || !form.description}>
            Create team
          </Button>
        </Card>
      )}

      {error ? (
        <ErrorState onRetry={() => mutate()} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-56" />
          ))}
        </div>
      ) : data.teams.length === 0 ? (
        <EmptyState icon={Users} title="No teams yet" description="Be the first to create one." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.teams.map((t: any) => (
            <TeamCard key={t.id} team={t} />
          ))}
        </div>
      )}
    </div>
  );
}