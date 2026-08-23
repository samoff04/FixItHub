"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/hooks/client-hooks";
import { Card, Button, SkeletonBlock } from "@/components/ui";
import { useToast } from "@/components/providers";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`h-6 w-11 rounded-full transition-colors ${checked ? "bg-primary" : "bg-white/10"}`}
      role="switch"
      aria-checked={checked}
    >
      <span className={`block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}

export default function SettingsPage() {
  const { data, isLoading, mutate } = useSWR("/api/settings", fetcher);
  const { push } = useToast();
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data?.settings) setForm(data.settings);
  }, [data]);

  async function save() {
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      push("Settings saved", "success");
      mutate();
    } else push("Could not save settings", "error");
  }

  if (isLoading || !form) return <SkeletonBlock className="h-80" />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-semibold text-white">Settings</h1>

      <Card className="space-y-4">
        <p className="text-sm font-medium text-gray-200">Notifications</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Email notifications</span>
          <Toggle checked={form.emailNotifications} onChange={(v) => setForm({ ...form, emailNotifications: v })} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Push / in-app notifications</span>
          <Toggle checked={form.pushNotifications} onChange={(v) => setForm({ ...form, pushNotifications: v })} />
        </div>
      </Card>

      <Card className="space-y-4">
        <p className="text-sm font-medium text-gray-200">Privacy</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Profile visibility</span>
          <select
            value={form.profileVisibility}
            onChange={(e) => setForm({ ...form, profileVisibility: e.target.value })}
            className="focus-ring rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-200"
          >
            <option value="public">Public</option>
            <option value="connections">Connections only</option>
            <option value="private">Private</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Show availability on profile</span>
          <Toggle checked={form.showAvailability} onChange={(v) => setForm({ ...form, showAvailability: v })} />
        </div>
      </Card>

      <Button loading={saving} onClick={save}>
        Save changes
      </Button>
    </div>
  );
}