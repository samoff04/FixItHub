"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { Card, Avatar, Badge } from "./ui";
import type { ApiTeam } from "@/types";

export function TeamCard({ team }: { team: ApiTeam }) {
  return (
    <Link href={`/teams/${team.id}`}>
      <Card className="flex h-full flex-col gap-3 transition-transform hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <p className="font-medium text-gray-100">{team.name}</p>
          <Badge className={team.isOpen ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : ""}>
            {team.isOpen ? "Open" : "Closed"}
          </Badge>
        </div>
        <p className="line-clamp-2 text-sm text-gray-400">{team.description}</p>
        {team.event && <Badge>{team.event.title}</Badge>}
        <div className="flex flex-wrap gap-1.5">
          {team.lookingForRoles.slice(0, 3).map((r) => (
            <Badge key={r}>{r}</Badge>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex -space-x-2">
            {team.members.slice(0, 4).map((m) => (
              <Avatar key={m.id} name={m.user.name} src={m.user.avatarUrl} size={28} />
            ))}
          </div>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Users size={12} /> {team.members.length}/{team.maxMembers}
          </span>
        </div>
      </Card>
    </Link>
  );
}