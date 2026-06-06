"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  AtSign,
  Bell,
  CheckCheck,
  ListTodo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  NOTIFICATIONS,
  findPerson,
  timeAgo,
  type NotificationItem,
} from "@/lib/mock-data";
import { initials, cn } from "@/lib/utils";

const TYPE_META = {
  mention: { icon: AtSign, color: "bg-primary/10 text-primary" },
  task: { icon: ListTodo, color: "bg-warning/10 text-warning" },
  alert: { icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
} as const;

export function NotificationsPopover() {
  const [items, setItems] = React.useState(NOTIFICATIONS);
  const unread = items.filter((n) => !n.read);
  const recent = items.slice(0, 6);

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unread.length > 0 && (
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-destructive" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold">Notifications</h3>
            <p className="text-xs text-muted-foreground">
              {unread.length} unread · {items.length} total
            </p>
          </div>
          {unread.length > 0 && (
            <button
              onClick={markAllRead}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>

        <ul className="max-h-96 divide-y overflow-y-auto scrollbar-thin">
          {recent.map((n) => (
            <Row key={n.id} item={n} />
          ))}
        </ul>

        <div className="border-t p-2">
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link href="/notifications">See all notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Row({ item }: { item: NotificationItem }) {
  const actor = findPerson(item.actorId);
  const meta = TYPE_META[item.type];
  const Icon = meta.icon;

  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent/40",
          !item.read && "bg-primary/[0.03]",
        )}
      >
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md", meta.color)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            {actor && (
              <Avatar className="mt-0.5 h-4 w-4">
                <AvatarFallback className="text-[8px]">{initials(actor.name)}</AvatarFallback>
              </Avatar>
            )}
            <p className="text-sm leading-snug">{item.message}</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{timeAgo(item.createdAt)}</p>
        </div>
        {!item.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
      </Link>
    </li>
  );
}