"use client";

import * as React from "react";
import { Calendar, Filter, LayoutGrid, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TASKS, findPerson, type Task } from "@/lib/mock-data";
import { initials, cn } from "@/lib/utils";

const COLUMNS: { id: Task["status"]; label: string; tone: string }[] = [
  { id: "todo", label: "To do", tone: "bg-muted" },
  { id: "in_progress", label: "In progress", tone: "bg-primary/15" },
  { id: "review", label: "In review", tone: "bg-warning/15" },
  { id: "done", label: "Done", tone: "bg-success/15" },
];

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            {TASKS.length} tasks · {TASKS.filter((t) => t.status === "done").length} closed
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button>
            <Plus className="h-4 w-4" />
            New task
          </Button>
        </div>
      </div>

      <Tabs defaultValue="board">
        <TabsList>
          <TabsTrigger value="board">
            <LayoutGrid className="h-4 w-4" />
            Board
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="board">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {COLUMNS.map((col) => {
              const items = TASKS.filter((t) => t.status === col.id);
              return (
                <div key={col.id} className="rounded-xl border bg-card">
                  <div className="flex items-center justify-between gap-2 border-b px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2 w-2 rounded-full", col.tone)} />
                      <h3 className="text-sm font-semibold">{col.label}</h3>
                      <Badge variant="muted">{items.length}</Badge>
                    </div>
                    <button className="text-muted-foreground hover:text-foreground" aria-label="Add task to column">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-2 p-2 min-h-32">
                    {items.map((t) => (
                      <TaskCard key={t.id} task={t} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarPlaceholder />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const assignee = findPerson(task.assigneeId);
  return (
    <div className="rounded-lg border bg-background p-3 shadow-xs transition-shadow hover:shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug">{task.title}</p>
        <span
          className={cn(
            "mt-1 h-2 w-2 shrink-0 rounded-full",
            task.priority === "high"
              ? "bg-destructive"
              : task.priority === "medium"
                ? "bg-warning"
                : "bg-muted-foreground/50",
          )}
          title={`Priority: ${task.priority}`}
        />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          {task.tag && <Badge variant="outline">{task.tag}</Badge>}
          <span>{task.dueDate}</span>
        </div>
        <Avatar className="h-6 w-6">
          <AvatarFallback className="text-[10px]">
            {assignee ? initials(assignee.name) : "?"}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}

function CalendarPlaceholder() {
  const days = Array.from({ length: 35 }, (_, i) => i - 5);
  return (
    <div className="rounded-xl border bg-card">
      <div className="grid grid-cols-7 border-b text-center text-xs font-medium text-muted-foreground">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((d, i) => {
          const tasks = d > 0 && d < 30 ? TASKS.filter((t) => parseInt(t.dueDate.slice(-2), 10) === d) : [];
          return (
            <div
              key={i}
              className={cn(
                "min-h-24 border-b border-r p-1.5 text-xs",
                d <= 0 || d > 30 ? "bg-muted/20 text-muted-foreground" : "",
                (i + 1) % 7 === 0 && "border-r-0",
              )}
            >
              <div className="font-medium">{d > 0 && d <= 30 ? d : ""}</div>
              <div className="mt-1 space-y-1">
                {tasks.slice(0, 2).map((t) => (
                  <div key={t.id} className="truncate rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                    {t.title}
                  </div>
                ))}
                {tasks.length > 2 && (
                  <div className="text-[10px] text-muted-foreground">+{tasks.length - 2} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}