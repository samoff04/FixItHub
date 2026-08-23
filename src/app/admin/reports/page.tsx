"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";
import { fetcher } from "@/hooks/client-hooks";
import { Card, Badge, Button, SkeletonBlock, EmptyState } from "@/components/ui";
import { ShieldAlert } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export default function AdminReportsPage() {
  const { data: session } = useSession();
  const { data, isLoading, mutate } = useSWR("/api/reports", fetcher);

  if ((session?.user as any)?.role !== "ADMIN") {
    return <EmptyState icon={ShieldAlert} title="Admins only" description="You don't have access to this page." />;
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    mutate();
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-white">Moderation queue</h1>
      {isLoading ? (
        <SkeletonBlock className="h-64" />
      ) : data.reports.length === 0 ? (
        <EmptyState icon={ShieldAlert} title="No reports" description="Nothing to review right now." />
      ) : (
        <div className="space-y-3">
          {data.reports.map((r: any) => (
            <Card key={r.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-200">
                  {r.reportedBy.name} reported {r.reportedUser.name}
                </p>
                <Badge>{r.status}</Badge>
              </div>
              <p className="text-sm text-gray-400">Reason: {r.reason}</p>
              {r.details && <p className="text-xs text-gray-500">{r.details}</p>}
              <p className="text-xs text-gray-600">{timeAgo(r.createdAt)}</p>
              <div className="flex gap-2 pt-1">
                <Button variant="secondary" onClick={() => updateStatus(r.id, "REVIEWING")}>
                  Reviewing
                </Button>
                <Button variant="secondary" onClick={() => updateStatus(r.id, "RESOLVED")}>
                  Resolve
                </Button>
                <Button variant="ghost" onClick={() => updateStatus(r.id, "DISMISSED")}>
                  Dismiss
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}