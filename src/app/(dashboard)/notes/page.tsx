"use client";

import * as React from "react";
import { Pin, PinOff, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { NOTES, type Note } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Tab = "all" | "personal" | "team" | "meeting";

export default function NotesPage() {
  const [tab, setTab] = React.useState<Tab>("all");
  const [pinned, setPinned] = React.useState(new Set(NOTES.filter((n) => n.pinned).map((n) => n.id)));
  const [query, setQuery] = React.useState("");

  const filtered = NOTES.filter((n) => {
    if (tab !== "all" && n.type !== tab) return false;
    if (query && !n.title.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const pinnedNotes = filtered.filter((n) => pinned.has(n.id));
  const otherNotes = filtered.filter((n) => !pinned.has(n.id));

  function togglePin(id: string) {
    setPinned((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
          <p className="text-sm text-muted-foreground">Personal scratchpads, team notes, and meeting minutes.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          New note
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="meeting">Meeting</TabsTrigger>
          </TabsList>
          <TabsContent value="all" />
          <TabsContent value="personal" />
          <TabsContent value="team" />
          <TabsContent value="meeting" />
        </Tabs>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notes…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {pinnedNotes.length > 0 && (
        <Section title="Pinned">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pinnedNotes.map((n) => (
              <NoteCard key={n.id} note={n} pinned onTogglePin={togglePin} />
            ))}
          </div>
        </Section>
      )}

      <Section title={pinnedNotes.length > 0 ? "Others" : "All notes"}>
        {otherNotes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing here.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {otherNotes.map((n) => (
              <NoteCard key={n.id} note={n} pinned={false} onTogglePin={togglePin} />
            ))}
          </div>
        )}
      </Section>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
        Auto-saved · synced just now
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      {children}
    </div>
  );
}

function NoteCard({
  note,
  pinned,
  onTogglePin,
}: {
  note: Note;
  pinned: boolean;
  onTogglePin: (id: string) => void;
}) {
  return (
    <Card className={cn("p-card transition-shadow hover:shadow-elevated", pinned && "border-primary/30")}>
      <div className="flex items-start justify-between">
        <Badge variant="muted" className="capitalize">
          {note.type}
        </Badge>
        <button
          onClick={() => onTogglePin(note.id)}
          aria-label={pinned ? "Unpin" : "Pin"}
          className="text-muted-foreground hover:text-foreground"
        >
          {pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
        </button>
      </div>
      <h3 className="mt-3 text-base font-semibold">{note.title}</h3>
      <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{note.excerpt}</p>
      <p className="mt-4 text-xs text-muted-foreground">Updated {note.updatedAt}</p>
    </Card>
  );
}