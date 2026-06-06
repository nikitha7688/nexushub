"use client";

import * as React from "react";
import { Calendar, LayoutGrid, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import {
  TASKS as INITIAL_TASKS,
  findPerson,
  type Task,
} from "@/lib/mock-data";
import { initials, cn } from "@/lib/utils";
import { TaskDetailsDialog } from "@/components/tasks/task-details-dialog";
import {
  TaskFilters,
  applyFilters,
  emptyFilters,
  type TaskFilterState,
} from "@/components/tasks/task-filters";

const COLUMNS: { id: Task["status"]; label: string; tone: string }[] = [
  { id: "todo", label: "To do", tone: "bg-muted-foreground/40" },
  { id: "in_progress", label: "In progress", tone: "bg-primary" },
  { id: "review", label: "In review", tone: "bg-warning" },
  { id: "done", label: "Done", tone: "bg-success" },
];

export default function TasksPage() {
  const [tasks, setTasks] = React.useState<Task[]>(INITIAL_TASKS);
  const [filters, setFilters] = React.useState<TaskFilterState>(emptyFilters);
  const [selected, setSelected] = React.useState<Task | null>(null);

  const visible = applyFilters(tasks, filters);

  function moveTask(id: string, to: Task["status"]) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: to } : t)));
  }

  function saveTask(updated: Task) {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            {visible.length} of {tasks.length} shown ·{" "}
            {tasks.filter((t) => t.status === "done").length} closed
          </p>
        </div>
        <div className="flex gap-2">
          <TaskFilters value={filters} onChange={setFilters} />
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
          <Board tasks={visible} onMove={moveTask} onSelect={setSelected} />
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarView tasks={visible} onSelect={setSelected} />
        </TabsContent>
      </Tabs>

      <TaskDetailsDialog
        task={selected}
        onClose={() => setSelected(null)}
        onSave={saveTask}
      />
    </div>
  );
}

function Board({
  tasks,
  onMove,
  onSelect,
}: {
  tasks: Task[];
  onMove: (id: string, to: Task["status"]) => void;
  onSelect: (t: Task) => void;
}) {
  const [dragOver, setDragOver] = React.useState<Task["status"] | null>(null);

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {COLUMNS.map((col) => {
        const items = tasks.filter((t) => t.status === col.id);
        const hovered = dragOver === col.id;
        return (
          <div
            key={col.id}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(col.id);
            }}
            onDragLeave={() => setDragOver((c) => (c === col.id ? null : c))}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("text/plain");
              if (id) onMove(id, col.id);
              setDragOver(null);
            }}
            className={cn(
              "rounded-xl border bg-card transition-colors",
              hovered && "border-primary bg-primary/[0.04]",
            )}
          >
            <div className="flex items-center justify-between gap-2 border-b px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", col.tone)} />
                <h3 className="text-sm font-semibold">{col.label}</h3>
                <Badge variant="muted">{items.length}</Badge>
              </div>
              <button
                className="text-muted-foreground hover:text-foreground"
                aria-label="Add task"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-32 space-y-2 p-2">
              {items.length === 0 ? (
                <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                  Drop tasks here
                </p>
              ) : (
                items.map((t) => (
                  <TaskCard key={t.id} task={t} onClick={() => onSelect(t)} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const assignee = findPerson(task.assigneeId);
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", task.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="cursor-grab rounded-lg border bg-background p-3 shadow-xs transition-all hover:shadow-soft active:cursor-grabbing"
    >
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

function CalendarView({
  tasks,
  onSelect,
}: {
  tasks: Task[];
  onSelect: (t: Task) => void;
}) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks match your filters"
        description="Adjust your filters or clear them to see tasks."
      />
    );
  }
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
          const tasksOnDay =
            d > 0 && d < 31
              ? tasks.filter((t) => parseInt(t.dueDate.slice(-2), 10) === d)
              : [];
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
                {tasksOnDay.slice(0, 2).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onSelect(t)}
                    className="block w-full truncate rounded bg-primary/10 px-1.5 py-0.5 text-left text-[10px] text-primary hover:bg-primary/20"
                  >
                    {t.title}
                  </button>
                ))}
                {tasksOnDay.length > 2 && (
                  <div className="text-[10px] text-muted-foreground">
                    +{tasksOnDay.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}