"use client";

import * as React from "react";
import { AlertTriangle, AtSign, CheckCheck, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  NOTIFICATIONS,
  findPerson,
  timeAgo,
  type NotificationItem,
} from "@/lib/mock-data";
import { initials, cn } from "@/lib/utils";

type Filter = "all" | "mention" | "task" | "alert";

const TYPE_META = {
  mention: { icon: AtSign, color: "bg-primary/10 text-primary" },
  task: { icon: ListTodo, color: "bg-warning/10 text-warning" },
  alert: { icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
} as const;

export default function NotificationsPage() {
  const [filter, setFilter] = React.useState<Filter>("all");
  const [items, setItems] = React.useState(NOTIFICATIONS);

  const filtered = items.filter((n) => filter === "all" || n.type === filter);
  const unread = filtered.filter((n) => !n.read);

  function toggleRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
  }

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unread.length} unread · {filtered.length} total
          </p>
        </div>
        <Button variant="outline" onClick={markAllRead} disabled={unread.length === 0}>
          <CheckCheck className="h-4 w-4" />
          Mark all as read
        </Button>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="mention">Mentions</TabsTrigger>
          <TabsTrigger value="task">Tasks</TabsTrigger>
          <TabsTrigger value="alert">Alerts</TabsTrigger>
        </TabsList>
        <TabsContent value={filter}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filtered.length === 0 ? (
                <div className="p-6">
                  <EmptyState title="You're all caught up" description="No notifications match this filter." />
                </div>
              ) : (
                <ul className="divide-y">
                  {filtered.map((n) => (
                    <NotificationRow key={n.id} item={n} onToggle={() => toggleRead(n.id)} />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationRow({
  item,
  onToggle,
}: {
  item: NotificationItem;
  onToggle: () => void;
}) {
  const actor = findPerson(item.actorId);
  const meta = TYPE_META[item.type];
  const Icon = meta.icon;

  return (
    <li
      className={cn(
        "flex items-start gap-3 px-card py-3 transition-colors hover:bg-accent/30",
        !item.read && "bg-primary/[0.03]",
      )}
    >
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md", meta.color)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          {actor && (
            <Avatar className="mt-0.5 h-5 w-5">
              <AvatarFallback className="text-[9px]">{initials(actor.name)}</AvatarFallback>
            </Avatar>
          )}
          <p className="text-sm leading-snug">{item.message}</p>
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="capitalize">
            {item.type}
          </Badge>
          <span>{timeAgo(item.createdAt)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {!item.read && <span className="h-2 w-2 rounded-full bg-primary" aria-label="Unread" />}
        <Button variant="ghost" size="sm" onClick={onToggle}>
          {item.read ? "Mark unread" : "Mark read"}
        </Button>
      </div>
    </li>
  );
}