"use client";

import * as React from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PEOPLE, type Task } from "@/lib/mock-data";
import { initials, cn } from "@/lib/utils";

export type DueFilter = "any" | "overdue" | "this_week" | "next_week";

export interface TaskFilterState {
  priorities: Set<Task["priority"]>;
  assignees: Set<string>;
  due: DueFilter;
}

export const emptyFilters: TaskFilterState = {
  priorities: new Set(),
  assignees: new Set(),
  due: "any",
};

export function activeFilterCount(f: TaskFilterState) {
  return f.priorities.size + f.assignees.size + (f.due !== "any" ? 1 : 0);
}

export function applyFilters(tasks: Task[], f: TaskFilterState): Task[] {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  const startOfNext = new Date(endOfWeek);
  startOfNext.setDate(endOfWeek.getDate() + 1);
  const endOfNext = new Date(startOfNext);
  endOfNext.setDate(startOfNext.getDate() + 6);

  return tasks.filter((t) => {
    if (f.priorities.size > 0 && !f.priorities.has(t.priority)) return false;
    if (f.assignees.size > 0 && !f.assignees.has(t.assigneeId)) return false;
    if (f.due !== "any") {
      const due = new Date(t.dueDate);
      if (f.due === "overdue" && (due >= now || t.status === "done")) return false;
      if (f.due === "this_week" && (due < startOfWeek || due > endOfWeek)) return false;
      if (f.due === "next_week" && (due < startOfNext || due > endOfNext)) return false;
    }
    return true;
  });
}

interface TaskFiltersProps {
  value: TaskFilterState;
  onChange: (v: TaskFilterState) => void;
}

export function TaskFilters({ value, onChange }: TaskFiltersProps) {
  const count = activeFilterCount(value);

  function togglePriority(p: Task["priority"]) {
    const next = new Set(value.priorities);
    if (next.has(p)) next.delete(p);
    else next.add(p);
    onChange({ ...value, priorities: next });
  }

  function toggleAssignee(id: string) {
    const next = new Set(value.assignees);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange({ ...value, assignees: next });
  }

  function setDue(d: DueFilter) {
    onChange({ ...value, due: d });
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Filter className="h-4 w-4" />
          Filter
          {count > 0 && (
            <Badge variant="default" className="ml-1 h-5 px-1.5">
              {count}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Filters</h3>
          {count > 0 && (
            <button
              onClick={() => onChange(emptyFilters)}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>

        <div className="mt-4 space-y-4">
          <Group label="Priority">
            <div className="space-y-1.5">
              {(["high", "medium", "low"] as const).map((p) => (
                <label key={p} className="flex items-center gap-2 text-sm capitalize">
                  <Checkbox
                    checked={value.priorities.has(p)}
                    onCheckedChange={() => togglePriority(p)}
                  />
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      p === "high" ? "bg-destructive" : p === "medium" ? "bg-warning" : "bg-muted-foreground/60",
                    )}
                  />
                  {p}
                </label>
              ))}
            </div>
          </Group>

          <Group label="Assignee">
            <div className="max-h-40 space-y-1 overflow-y-auto pr-1 scrollbar-thin">
              {PEOPLE.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={value.assignees.has(p.id)}
                    onCheckedChange={() => toggleAssignee(p.id)}
                  />
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[9px]">{initials(p.name)}</AvatarFallback>
                  </Avatar>
                  <span className="truncate">{p.name}</span>
                </label>
              ))}
            </div>
          </Group>

          <Group label="Due">
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { v: "any", label: "Any time" },
                  { v: "overdue", label: "Overdue" },
                  { v: "this_week", label: "This week" },
                  { v: "next_week", label: "Next week" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => setDue(opt.v)}
                  className={cn(
                    "rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                    value.due === opt.v
                      ? "border-primary bg-primary/10 text-foreground"
                      : "hover:bg-accent",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Group>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}