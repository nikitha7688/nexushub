"use client";

import * as React from "react";
import { Copy, Eye, EyeOff, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NOTIFICATIONS, timeAgo } from "@/lib/mock-data";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Workspace, security, appearance, and integrations.</p>
      </div>

      <Tabs defaultValue="security">
        <TabsList className="grid w-full grid-cols-2 sm:inline-flex sm:w-auto">
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="tokens">API tokens</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="security">
          <PasswordCard />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationPrefsCard />
        </TabsContent>
        <TabsContent value="appearance">
          <AppearanceCard />
        </TabsContent>
        <TabsContent value="tokens">
          <TokensCard />
        </TabsContent>
        <TabsContent value="activity">
          <ActivityCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PasswordCard() {
  const [show, setShow] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Password updated");
    }, 600);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>You&apos;ll be signed out from all other devices.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={save} className="max-w-md space-y-4">
          {["Current password", "New password", "Confirm new password"].map((label) => (
            <div key={label} className="space-y-1.5">
              <Label>{label}</Label>
              <div className="relative">
                <Input type={show ? "text" : "password"} placeholder="••••••••" />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={show ? "Hide" : "Show"}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Update password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function NotificationPrefsCard() {
  const prefs = [
    { id: "mentions", label: "Mentions", description: "When someone @mentions you in docs, notes, or tasks." },
    { id: "task_assignments", label: "Task assignments", description: "When a task is assigned to you." },
    { id: "task_due", label: "Task due soon", description: "1 day before a task due date." },
    { id: "doc_replies", label: "Document replies", description: "Replies to comments you authored." },
    { id: "weekly", label: "Weekly digest", description: "Summary of activity each Monday." },
    { id: "marketing", label: "Product updates", description: "Occasional emails about new features." },
  ];
  const channels = [
    { id: "email", label: "Email" },
    { id: "in_app", label: "In-app" },
    { id: "push", label: "Push" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification preferences</CardTitle>
        <CardDescription>Pick how and where you want to be reached.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-3 text-left font-medium">Event</th>
                {channels.map((c) => (
                  <th key={c.id} className="py-3 text-center font-medium">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {prefs.map((p) => (
                <tr key={p.id}>
                  <td className="py-3 pr-4">
                    <p className="font-medium">{p.label}</p>
                    <p className="text-xs text-muted-foreground">{p.description}</p>
                  </td>
                  {channels.map((c) => (
                    <td key={c.id} className="py-3 text-center">
                      <Checkbox defaultChecked={c.id !== "marketing"} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function AppearanceCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Tune how NexusHub looks on your device.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-md border p-4">
          <div>
            <p className="font-medium">Theme</p>
            <p className="text-sm text-muted-foreground">Switch between light, dark, and system.</p>
          </div>
          <ThemeToggle />
        </div>
        <div className="flex items-center justify-between rounded-md border p-4">
          <div>
            <p className="font-medium">Reduce motion</p>
            <p className="text-sm text-muted-foreground">Disable non-essential animations.</p>
          </div>
          <Checkbox />
        </div>
      </CardContent>
    </Card>
  );
}

interface Token {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  createdAt: string;
}

function TokensCard() {
  const [tokens, setTokens] = React.useState<Token[]>([
    { id: "tk_1", name: "CI deploy bot", prefix: "nxs_live_b8f1", scopes: ["read:docs", "write:tasks"], createdAt: "2026-04-12" },
    { id: "tk_2", name: "Analytics export", prefix: "nxs_live_e29c", scopes: ["read:*"], createdAt: "2026-05-30" },
  ]);

  function revoke(id: string) {
    setTokens((prev) => prev.filter((t) => t.id !== id));
    toast.success("Token revoked");
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>API tokens</CardTitle>
          <CardDescription>Personal access tokens for the NexusHub REST API.</CardDescription>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          New token
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {tokens.map((t) => (
          <div key={t.id} className="flex items-center justify-between rounded-md border p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{t.name}</p>
                {t.scopes.map((s) => (
                  <Badge key={s} variant="muted">
                    {s}
                  </Badge>
                ))}
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <code className="font-mono">{t.prefix}…</code>
                <button
                  className="hover:text-foreground"
                  onClick={() => {
                    navigator.clipboard?.writeText(t.prefix);
                    toast.success("Copied prefix");
                  }}
                  aria-label="Copy"
                >
                  <Copy className="h-3 w-3" />
                </button>
                <span>· created {t.createdAt}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => revoke(t.id)}>
              <Trash2 className="h-4 w-4" />
              Revoke
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ActivityCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity history</CardTitle>
        <CardDescription>Recent actions on your account.</CardDescription>
      </CardHeader>
      <CardContent className="divide-y">
        {NOTIFICATIONS.map((a) => (
          <div key={a.id} className="py-2.5">
            <p className="text-sm">{a.message}</p>
            <p className="text-xs text-muted-foreground">{timeAgo(a.createdAt)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}