"use client";

import useSWR from "swr";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { fetcher } from "@/hooks/client-hooks";
import { Card, SkeletonBlock, Button, Avatar } from "@/components/ui";
import { UserCard } from "@/components/user-card";
import { EventCard } from "@/components/event-card";
import { UserPlus, CalendarDays, Compass } from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: discover, isLoading: loadingDiscover } = useSWR("/api/discover?page=1", fetcher);
  const { data: connections } = useSWR("/api/connections", fetcher);
  const { data: events, isLoading: loadingEvents } = useSWR("/api/events?upcoming=true", fetcher);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Welcome back, {session?.user?.name?.split(" ")[0]} 👋</h1>
        <p className="mt-1 text-sm text-gray-500">Here&apos;s what&apos;s happening around your network.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs text-gray-500">Connections</p>
          <p className="font-display text-3xl font-semibold text-white">{connections?.connections?.length ?? "—"}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Pending requests</p>
          <p className="font-display text-3xl font-semibold text-white">{connections?.incoming?.length ?? "—"}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Upcoming events</p>
          <p className="font-display text-3xl font-semibold text-white">{events?.events?.length ?? "—"}</p>
        </Card>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg text-gray-200">
            <Compass size={18} className="text-accent" /> Recommended for you
          </h2>
          <Link href="/discover" className="text-sm text-accent hover:underline">
            See all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loadingDiscover
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonBlock key={i} className="h-48" />)
            : discover?.users?.slice(0, 3).map((u: any) => <UserCard key={u.id} user={u} />)}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg text-gray-200">
            <CalendarDays size={18} className="text-accent" /> Upcoming events
          </h2>
          <Link href="/events" className="text-sm text-accent hover:underline">
            See all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loadingEvents
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonBlock key={i} className="h-40" />)
            : events?.events?.slice(0, 3).map((e: any) => <EventCard key={e.id} event={e} />)}
        </div>
      </section>

      {connections?.incoming?.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg text-gray-200">
            <UserPlus size={18} className="text-accent" /> Pending requests
          </h2>
          <div className="space-y-2">
            {connections.incoming.map((r: any) => (
              <Card key={r.id} className="flex items-center justify-between !p-3">
                <div className="flex items-center gap-3">
                  <Avatar name={r.sender.name} src={r.sender.avatarUrl} size={32} />
                  <div>
                    <p className="text-sm text-gray-200">{r.sender.name}</p>
                    <p className="text-xs text-gray-500">wants to connect</p>
                  </div>
                </div>
                <Link href="/discover">
                  <Button variant="secondary">Review</Button>
                </Link>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}