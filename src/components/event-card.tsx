"use client";

import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Card, Badge } from "./ui";
import type { ApiEvent } from "@/types";

export function EventCard({ event }: { event: ApiEvent }) {
  return (
    <Link href={`/events/${event.id}`}>
      <Card className="flex h-full flex-col gap-3 transition-transform hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <Badge className="border-primary/30 bg-primary/10 text-primary-light">{event.type}</Badge>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <CalendarDays size={12} /> {new Date(event.startDate).toLocaleDateString()}
          </span>
        </div>
        <p className="font-display text-lg font-medium text-gray-100">{event.title}</p>
        <p className="line-clamp-2 text-sm text-gray-400">{event.description}</p>
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin size={12} /> {event.isOnline ? "Online" : event.location ?? "TBD"}
          </span>
          <span className="flex items-center gap-1">
            <Users size={12} /> {event._count?.participants ?? 0} joined
          </span>
        </div>
      </Card>
    </Link>
  );
}