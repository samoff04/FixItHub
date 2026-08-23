"use client";

import { useState } from "react";
import useSWR from "swr";
import { Plus, CalendarDays } from "lucide-react";
import { fetcher } from "@/hooks/client-hooks";
import { EventCard } from "@/components/event-card";
import { Button, Card, Input, Textarea, EmptyState, SkeletonBlock, ErrorState } from "@/components/ui";
import { useToast } from "@/components/providers";

export default function EventsPage() {
  const { data, error, isLoading, mutate } = useSWR("/api/events?upcoming=true", fetcher);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const { push } = useToast();
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "hackathon",
    startDate: "",
    endDate: "",
    isOnline: true,
    maxTeamSize: 4,
  });

  async function createEvent() {
    setSaving(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(body.error));
      push("Event created!", "success");
      setCreating(false);
      mutate();
    } catch {
      push("Could not create event — check dates", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">Events</h1>
          <p className="mt-1 text-sm text-gray-500">Hackathons and project sprints happening soon.</p>
        </div>
        <Button onClick={() => setCreating((c) => !c)}>
          <Plus size={14} /> New event
        </Button>
      </div>

      {creating && (
        <Card className="space-y-3">
          <Input placeholder="Event title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            <Input type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>
          <Button
            loading={saving}
            onClick={createEvent}
            disabled={!form.title || !form.description || !form.startDate || !form.endDate}
          >
            Create event
          </Button>
        </Card>
      )}

      {error ? (
        <ErrorState onRetry={() => mutate()} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-48" />
          ))}
        </div>
      ) : data.events.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No upcoming events" description="Create one to get things started." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.events.map((e: any) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}