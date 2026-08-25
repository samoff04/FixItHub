"use client";

import useSWR from "swr";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { fetcher } from "@/hooks/client-hooks";
import { Card, SkeletonBlock, Button, Avatar, Badge } from "@/components/ui";
import { UserCard } from "@/components/user-card";
import { EventCard } from "@/components/event-card";
import { UserPlus, CalendarDays, Compass, Users, ArrowRight, TrendingUp } from "lucide-react";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: discover, isLoading: loadingDiscover } = useSWR("/api/discover?page=1", fetcher);
  const { data: connections } = useSWR("/api/connections", fetcher);
  const { data: events, isLoading: loadingEvents } = useSWR("/api/events?upcoming=true", fetcher);

  const stats = [
    { label: "Connections", value: connections?.connections?.length, icon: Users, tint: "text-primary-light", bg: "bg-primary/10" },
    { label: "Pending requests", value: connections?.incoming?.length, icon: UserPlus, tint: "text-accent", bg: "bg-accent/10" },
    { label: "Upcoming events", value: events?.events?.length, icon: CalendarDays, tint: "text-signal", bg: "bg-signal/10" },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="glass spotlight-card relative overflow-hidden rounded-3xl p-8">
        <div className="pointer-events-none absolute -top-20 right-0 h-64 w-64 rounded-full bg-primary/20 blur-[100px]" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-accent">{greeting()}</p>
            <h1 className="font-display mt-1 text-3xl font-semibold text-white">
              {session?.user?.name?.split(" ")[0] ?? "there"}, let&apos;s find your next team.
            </h1>
            <p className="mt-2 max-w-lg text-sm text-gray-400">
              Here&apos;s what&apos;s moving around your network right now.
            </p>
          </div>
          <Link href="/discover">
            <Button className="shrink-0">
              <Compass size={15} /> Discover teammates
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="flex items-center gap-4">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.bg} ${s.tint}`}>
              <s.icon size={20} />
            </span>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="font-display text-2xl font-semibold text-white">
                {s.value ?? <span className="inline-block h-6 w-8 skeleton rounded" />}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Pending requests strip */}
      {connections?.incoming?.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <UserPlus size={16} className="text-accent" />
            <h2 className="font-display text-base font-medium text-gray-200">Waiting on you</h2>
            <Badge glow className="ml-1">{connections.incoming.length} new</Badge>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {connections.incoming.map((r: any) => (
              <Card key={r.id} className="flex min-w-[220px] shrink-0 items-center justify-between gap-3 !p-3">
                <div className="flex items-center gap-2.5">
                  <Avatar name={r.sender.name} src={r.sender.avatarUrl} size={34} />
                  <div>
                    <p className="text-sm text-gray-200">{r.sender.name}</p>
                    <p className="text-xs text-gray-500">wants to connect</p>
                  </div>
                </div>
                <Link href="/discover">
                  <Button variant="secondary" className="!px-3 !py-1.5 text-xs">
                    Review
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Recommended */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg text-gray-200">
            <TrendingUp size={18} className="text-accent" /> Recommended for you
          </h2>
          <Link href="/discover" className="flex items-center gap-1 text-sm text-accent hover:underline">
            See all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loadingDiscover
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonBlock key={i} className="h-52" />)
            : discover?.users?.slice(0, 3).map((u: any) => <UserCard key={u.id} user={u} />)}
        </div>
      </section>

      {/* Events */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg text-gray-200">
            <CalendarDays size={18} className="text-accent" /> Upcoming events
          </h2>
          <Link href="/events" className="flex items-center gap-1 text-sm text-accent hover:underline">
            See all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loadingEvents
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonBlock key={i} className="h-44" />)
            : events?.events?.slice(0, 3).map((e: any) => <EventCard key={e.id} event={e} />)}
        </div>
      </section>
    </div>
  );
}