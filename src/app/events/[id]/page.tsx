"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { fetcher } from "@/hooks/client-hooks";
import { TeamCard } from "@/components/team-card";
import { Card, Badge, Button, SkeletonBlock, ErrorState, EmptyState } from "@/components/ui";
import { useToast } from "@/components/providers";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { push } = useToast();
  const { data, error, isLoading, mutate } = useSWR(`/api/events/${id}`, fetcher);

  if (isLoading) return <SkeletonBlock className="h-96" />;
  if (error) return <ErrorState onRetry={() => mutate()} />;
  const event = data.event;

  async function toggleJoin() {
    const res = await fetch(`/api/events/${id}/join`, { method: event.isJoined ? "DELETE" : "POST" });
    if (res.ok) {
      push(event.isJoined ? "Left event" : "Joined event!", "success");
      mutate();
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <Badge className="border-primary/30 bg-primary/10 text-primary-light">{event.type}</Badge>
            <p className="font-display mt-2 text-2xl font-semibold text-white">{event.title}</p>
          </div>
          <Button variant={event.isJoined ? "secondary" : "primary"} onClick={toggleJoin}>
            {event.isJoined ? "Leave event" : "Join event"}
          </Button>
        </div>
        <p className="text-sm text-gray-300">{event.description}</p>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <CalendarDays size={14} /> {new Date(event.startDate).toLocaleDateString()} – {new Date(event.endDate).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={14} /> {event.isOnline ? "Online" : event.location ?? "TBD"}
          </span>
          <span className="flex items-center gap-1">
            <Users size={14} /> {event._count.participants} participants · {event._count.teams} teams
          </span>
        </div>
      </Card>

      <div>
        <p className="mb-3 text-sm font-medium text-gray-200">Teams for this event</p>
        {event.teams.length === 0 ? (
          <EmptyState icon={Users} title="No teams yet" description="Start one from the Teams page and link it to this event." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {event.teams.map((t: any) => (
              <TeamCard key={t.id} team={{ ...t, event: { id: event.id, title: event.title } }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}