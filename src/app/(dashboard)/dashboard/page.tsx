import Link from "next/link";
import { ArrowUpRight, CheckCircle2, FileText, ListTodo, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  CURRENT_USER,
  DOCUMENTS,
  NOTIFICATIONS,
  TASKS,
  findPerson,
  timeAgo,
} from "@/lib/mock-data";
import { initials } from "@/lib/utils";

const stats = [
  { label: "Open tasks", value: TASKS.filter((t) => t.status !== "done").length, sub: "+3 this week", icon: ListTodo },
  { label: "Documents", value: DOCUMENTS.length, sub: "2 updated today", icon: FileText },
  { label: "Team members", value: 8, sub: "1 invited", icon: Users },
  { label: "Closed this week", value: TASKS.filter((t) => t.status === "done").length, sub: "+1 vs last week", icon: CheckCircle2 },
];

export default function DashboardPage() {
  const myTasks = TASKS.filter((t) => t.assigneeId === CURRENT_USER.id && t.status !== "done").slice(0, 5);
  const recentDocs = [...DOCUMENTS].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);
  const activity = NOTIFICATIONS.slice(0, 6);
  const totalTasks = TASKS.length;
  const doneTasks = TASKS.filter((t) => t.status === "done").length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {CURRENT_USER.name.split(" ")[0]}</h1>
          <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening in your workspace today.</p>
        </div>
        <Button asChild>
          <Link href="/tasks">
            <Plus className="h-4 w-4" />
            New task
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="space-y-1 pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>{s.label}</CardDescription>
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl">{s.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>My tasks</CardTitle>
                <CardDescription>Things assigned to you, sorted by due date.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/tasks">
                  View all <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {myTasks.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-md border p-3">
                <div className={`h-2 w-2 rounded-full ${priorityDot(t.priority)}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">Due {t.dueDate}</p>
                </div>
                <Badge variant="muted">{t.status.replace("_", " ")}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sprint progress</CardTitle>
            <CardDescription>Tasks closed vs total</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold">{doneTasks}</span>
              <span className="text-sm text-muted-foreground">/ {totalTasks}</span>
            </div>
            <Progress value={(doneTasks / totalTasks) * 100} />
            <p className="text-xs text-muted-foreground">
              {Math.round((doneTasks / totalTasks) * 100)}% complete — 6 days remaining.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recently updated docs</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/documents">
                  View all <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="divide-y">
            {recentDocs.map((d) => {
              const author = findPerson(d.authorId);
              return (
                <div key={d.id} className="flex items-center gap-3 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{d.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {author?.name} · {d.updatedAt}
                    </p>
                  </div>
                  <Badge variant="outline">{d.category}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Activity feed</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/notifications">
                  View all <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {activity.map((a) => {
              const actor = findPerson(a.actorId);
              return (
                <div key={a.id} className="flex items-start gap-3">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">
                      {actor ? initials(actor.name) : "•"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{a.message}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(a.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function priorityDot(p: "low" | "medium" | "high") {
  return p === "high" ? "bg-destructive" : p === "medium" ? "bg-warning" : "bg-muted-foreground/60";
}