"use client";

import * as React from "react";
import { Pin, PinOff, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NOTES as INITIAL_NOTES, type Note } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Tab = "all" | "personal" | "team" | "meeting";
type SaveState = "idle" | "saving" | "saved";

export default function NotesPage() {
  const [notes, setNotes] = React.useState<Note[]>(INITIAL_NOTES);
  const [tab, setTab] = React.useState<Tab>("all");
  const [query, setQuery] = React.useState("");
  const [editing, setEditing] = React.useState<Note | null>(null);
  const [saveState, setSaveState] = React.useState<SaveState>("saved");
  const [lastSavedAt, setLastSavedAt] = React.useState<Date>(new Date());

  const filtered = notes.filter((n) => {
    if (tab !== "all" && n.type !== tab) return false;
    if (query && !n.title.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });
  const pinnedNotes = filtered.filter((n) => n.pinned);
  const otherNotes = filtered.filter((n) => !n.pinned);

  function togglePin(id: string) {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
  }

  function updateNote(updated: Note) {
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
  }

  function createNote() {
    const blank: Note = {
      id: `n_${Date.now()}`,
      title: "Untitled",
      type: "personal",
      excerpt: "",
      updatedAt: new Date().toISOString().slice(0, 10),
      pinned: false,
    };
    setNotes((prev) => [blank, ...prev]);
    setEditing(blank);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
          <p className="text-sm text-muted-foreground">
            Personal scratchpads, team notes, and meeting minutes.
          </p>
        </div>
        <Button onClick={createNote}>
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
          <TabsContent value={tab} />
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
              <NoteCard
                key={n.id}
                note={n}
                pinned
                onTogglePin={togglePin}
                onOpen={() => setEditing(n)}
              />
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
              <NoteCard
                key={n.id}
                note={n}
                pinned={false}
                onTogglePin={togglePin}
                onOpen={() => setEditing(n)}
              />
            ))}
          </div>
        )}
      </Section>

      <SaveBadge state={saveState} lastSavedAt={lastSavedAt} />

      <NoteEditor
        note={editing}
        onClose={() => setEditing(null)}
        onChange={updateNote}
        onSaveStateChange={(s) => {
          setSaveState(s);
          if (s === "saved") setLastSavedAt(new Date());
        }}
      />
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
  onOpen,
}: {
  note: Note;
  pinned: boolean;
  onTogglePin: (id: string) => void;
  onOpen: () => void;
}) {
  return (
    <Card
      onClick={onOpen}
      className={cn(
        "cursor-pointer p-card transition-shadow hover:shadow-elevated",
        pinned && "border-primary/30",
      )}
    >
      <div className="flex items-start justify-between">
        <Badge variant="muted" className="capitalize">
          {note.type}
        </Badge>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(note.id);
          }}
          aria-label={pinned ? "Unpin" : "Pin"}
          className="text-muted-foreground hover:text-foreground"
        >
          {pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
        </button>
      </div>
      <h3 className="mt-3 text-base font-semibold">{note.title}</h3>
      <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
        {note.excerpt || <span className="italic">No content yet.</span>}
      </p>
      <p className="mt-4 text-xs text-muted-foreground">Updated {note.updatedAt}</p>
    </Card>
  );
}

function SaveBadge({ state, lastSavedAt }: { state: SaveState; lastSavedAt: Date }) {
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    const t = setInterval(force, 30_000);
    return () => clearInterval(t);
  }, []);

  if (state === "saving") {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-warning" />
        Saving…
      </div>
    );
  }

  const seconds = Math.max(1, Math.floor((Date.now() - lastSavedAt.getTime()) / 1000));
  const label = seconds < 60 ? `${seconds}s ago` : `${Math.floor(seconds / 60)}m ago`;

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
      Auto-saved · synced {label}
    </div>
  );
}

function NoteEditor({
  note,
  onClose,
  onChange,
  onSaveStateChange,
}: {
  note: Note | null;
  onClose: () => void;
  onChange: (n: Note) => void;
  onSaveStateChange: (s: SaveState) => void;
}) {
  const [draft, setDraft] = React.useState<Note | null>(note);
  const saveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    setDraft(note);
  }, [note]);

  // Debounced auto-save: every keystroke flips to "saving", commits after 600ms idle.
  function patch(part: Partial<Note>) {
    if (!draft) return;
    const next = { ...draft, ...part };
    setDraft(next);
    onSaveStateChange("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const committed: Note = {
        ...next,
        excerpt: next.excerpt || next.title,
        updatedAt: new Date().toISOString().slice(0, 10),
      };
      onChange(committed);
      onSaveStateChange("saved");
    }, 600);
  }

  if (!draft) return null;

  return (
    <Dialog open={!!note} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit note</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="note-title">Title</Label>
            <Input
              id="note-title"
              value={draft.title}
              onChange={(e) => patch({ title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={draft.type}
                onValueChange={(v) => patch({ type: v as Note["type"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant={draft.pinned ? "secondary" : "outline"}
                className="w-full"
                onClick={() => patch({ pinned: !draft.pinned })}
              >
                {draft.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                {draft.pinned ? "Unpin" : "Pin"}
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note-body">Content</Label>
            <Textarea
              id="note-body"
              rows={8}
              placeholder="Start writing…"
              value={draft.excerpt}
              onChange={(e) => patch({ excerpt: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}