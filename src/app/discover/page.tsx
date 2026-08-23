"use client";

import { useState } from "react";
import useSWR from "swr";
import { Search, Filter, UserPlus, X, Check } from "lucide-react";
import { fetcher } from "@/hooks/client-hooks";
import { UserCard } from "@/components/user-card";
import { Input, Button, SkeletonBlock, EmptyState, ErrorState, Card, Avatar } from "@/components/ui";
import { useToast } from "@/components/providers";
import useSWRImmutable from "swr";

const ROLE_OPTIONS = ["frontend", "backend", "designer", "pm", "ml", "mobile", "devops", "data"];
const GOAL_OPTIONS = ["hackathon", "startup", "research", "portfolio", "open-source"];

export default function DiscoverPage() {
  const [q, setQ] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const { push } = useToast();

  const params = new URLSearchParams({ q, roles: roles.join(","), goals: goals.join(","), page: String(page) });
  const { data, error, isLoading, mutate } = useSWR(`/api/discover?${params.toString()}`, fetcher);
  const { data: requestsData, mutate: mutateRequests } = useSWRImmutable("/api/connections", fetcher);

  function toggle(list: string[], setList: (v: string[]) => void, val: string) {
    setList(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);
    setPage(1);
  }

  async function respond(id: string, action: "accept" | "decline") {
    const res = await fetch(`/api/connections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      mutateRequests();
      mutate();
      push(action === "accept" ? "Connection accepted" : "Request declined", "success");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Discover teammates</h1>
        <p className="mt-1 text-sm text-gray-500">Ranked by match score based on your skills, roles, and goals.</p>
      </div>

      {requestsData?.incoming?.length > 0 && (
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <UserPlus size={14} className="text-accent" /> Pending requests
          </p>
          <div className="flex flex-wrap gap-2">
            {requestsData.incoming.map((r: any) => (
              <Card key={r.id} className="flex items-center gap-3 !p-3">
                <Avatar name={r.sender.name} src={r.sender.avatarUrl} size={28} />
                <span className="text-sm text-gray-200">{r.sender.name}</span>
                <button onClick={() => respond(r.id, "accept")} className="text-emerald-400 hover:text-emerald-300" aria-label="Accept">
                  <Check size={16} />
                </button>
                <button onClick={() => respond(r.id, "decline")} className="text-rose-400 hover:text-rose-300" aria-label="Decline">
                  <X size={16} />
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="glass flex flex-col gap-3 rounded-2xl p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <Input
            className="pl-9"
            placeholder="Search by name, username, or bio…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Filter size={14} className="text-gray-500" />
          {ROLE_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => toggle(roles, setRoles, r)}
              className={`rounded-full border px-3 py-1 transition-colors ${
                roles.includes(r) ? "border-primary bg-primary/20 text-primary-light" : "border-white/10 text-gray-400 hover:bg-white/5"
              }`}
            >
              {r}
            </button>
          ))}
          <span className="mx-1 h-4 w-px bg-white/10" />
          {GOAL_OPTIONS.map((g) => (
            <button
              key={g}
              onClick={() => toggle(goals, setGoals, g)}
              className={`rounded-full border px-3 py-1 transition-colors ${
                goals.includes(g) ? "border-accent bg-accent/20 text-accent" : "border-white/10 text-gray-400 hover:bg-white/5"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <ErrorState onRetry={() => mutate()} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-52" />
          ))}
        </div>
      ) : data?.users?.length === 0 ? (
        <EmptyState icon={Search} title="No matches found" description="Try adjusting your filters or search terms." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.users.map((u: any) => (
              <UserCard key={u.id} user={u} />
            ))}
          </div>
          <div className="flex justify-center gap-2 pt-2">
            <Button variant="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="secondary" disabled={page * 12 >= data.total} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}