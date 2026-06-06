"use client";

import * as React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PEOPLE, type Person } from "@/lib/mock-data";
import { initials, cn } from "@/lib/utils";

interface MentionInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function MentionInput({
  value,
  onChange,
  placeholder = "Write something… use @ to mention someone",
  rows = 3,
  className,
}: MentionInputProps) {
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const [query, setQuery] = React.useState<string | null>(null);
  const [highlight, setHighlight] = React.useState(0);

  const matches = React.useMemo<Person[]>(() => {
    if (query === null) return [];
    const q = query.toLowerCase();
    return PEOPLE.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 5);
  }, [query]);

  React.useEffect(() => {
    setHighlight(0);
  }, [query]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const v = e.target.value;
    onChange(v);
    const caret = e.target.selectionStart;
    const before = v.slice(0, caret);
    const m = before.match(/@(\w*)$/);
    setQuery(m ? m[1] : null);
  }

  function insertMention(p: Person) {
    const el = ref.current;
    if (!el) return;
    const caret = el.selectionStart;
    const before = value.slice(0, caret);
    const after = value.slice(caret);
    const replaced = before.replace(/@\w*$/, `@${p.name.replace(/\s+/g, "")} `);
    const next = replaced + after;
    onChange(next);
    setQuery(null);
    requestAnimationFrame(() => {
      el.focus();
      const pos = replaced.length;
      el.selectionStart = pos;
      el.selectionEnd = pos;
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (query === null || matches.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % matches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + matches.length) % matches.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      insertMention(matches[highlight]);
    } else if (e.key === "Escape") {
      setQuery(null);
    }
  }

  return (
    <div className={cn("relative", className)}>
      <textarea
        ref={ref}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs",
          "ring-offset-background placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        )}
      />
      {query !== null && matches.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-popover mt-1 max-h-56 overflow-y-auto rounded-md border bg-popover p-1 shadow-elevated">
          {matches.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => insertMention(p)}
              onMouseEnter={() => setHighlight(i)}
              className={cn(
                "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm",
                i === highlight ? "bg-accent" : "hover:bg-accent/60",
              )}
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px]">{initials(p.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="truncate text-xs text-muted-foreground">{p.email}</p>
              </div>
              <span className="text-[10px] text-muted-foreground">{p.role}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function renderMentions(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const re = /@(\w+)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const handle = m[1];
    const person = PEOPLE.find(
      (p) => p.name.replace(/\s+/g, "").toLowerCase() === handle.toLowerCase(),
    );
    parts.push(
      <span
        key={key++}
        className="rounded bg-primary/10 px-1 font-medium text-primary"
      >
        @{person ? person.name : handle}
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}