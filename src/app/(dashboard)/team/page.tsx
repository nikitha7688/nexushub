"use client";

import * as React from "react";
import { AtSign, MoreHorizontal, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NOTIFICATIONS, PEOPLE, findPerson, timeAgo } from "@/lib/mock-data";
import { initials } from "@/lib/utils";

export default function TeamPage() {
  const [query, setQuery] = React.useState("");

  const filtered = PEOPLE.filter((p) =>
    [p.name, p.email, p.department, p.role].some((s) => s.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
          <p className="text-sm text-muted-foreground">{PEOPLE.length} members across your workspace.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Invite member
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Members</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search members…"
                  className="pl-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{initials(p.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.role === "Admin" ? "default" : "muted"}>{p.role}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{p.department}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.joinedAt}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" aria-label="More">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity feed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {NOTIFICATIONS.slice(0, 8).map((a) => {
              const actor = findPerson(a.actorId);
              return (
                <div key={a.id} className="flex items-start gap-3">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">
                      {actor ? initials(actor.name) : "•"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm leading-snug">{a.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{timeAgo(a.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AtSign className="h-4 w-4" />
            Mentions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Type{" "}
            <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-xs">@name</kbd> in any
            doc, note, or task to mention a teammate — they&apos;ll get a notification in real time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}