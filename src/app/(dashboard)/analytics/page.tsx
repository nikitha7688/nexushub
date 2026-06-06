import { ArrowDown, ArrowUp, BarChart3, FileText, ListTodo, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DOCUMENTS, PEOPLE, TASKS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const kpis = [
  {
    label: "Tasks closed (7d)",
    value: TASKS.filter((t) => t.status === "done").length,
    delta: +18,
    icon: ListTodo,
  },
  { label: "Docs created (7d)", value: DOCUMENTS.length, delta: +6, icon: FileText },
  { label: "Active members", value: PEOPLE.length, delta: 0, icon: Users },
  { label: "Avg cycle time", value: "3.2 d", delta: -12, icon: BarChart3 },
];

const sparkData = [12, 18, 15, 22, 28, 24, 32, 30, 36, 42, 38, 44];

const teamLoad = [
  { name: "Engineering", value: 84 },
  { name: "Product", value: 62 },
  { name: "Design", value: 48 },
  { name: "Operations", value: 40 },
  { name: "Marketing", value: 28 },
];

const taskBreakdown = [
  { label: "Done", count: TASKS.filter((t) => t.status === "done").length, color: "bg-success" },
  { label: "In review", count: TASKS.filter((t) => t.status === "review").length, color: "bg-warning" },
  { label: "In progress", count: TASKS.filter((t) => t.status === "in_progress").length, color: "bg-primary" },
  { label: "To do", count: TASKS.filter((t) => t.status === "todo").length, color: "bg-muted-foreground/40" },
];

export default function AnalyticsPage() {
  const total = taskBreakdown.reduce((s, b) => s + b.count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Workspace velocity, throughput, and team load.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardHeader className="space-y-1 pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>{k.label}</CardDescription>
                <k.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl">{k.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <Delta value={k.delta} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Task throughput</CardTitle>
            <CardDescription>Tasks closed per day · last 12 days</CardDescription>
          </CardHeader>
          <CardContent>
            <Sparkbar data={sparkData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task status</CardTitle>
            <CardDescription>{total} tracked</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
              {taskBreakdown.map((b) => (
                <div key={b.label} className={cn(b.color)} style={{ width: `${(b.count / total) * 100}%` }} />
              ))}
            </div>
            <ul className="space-y-1.5 text-sm">
              {taskBreakdown.map((b) => (
                <li key={b.label} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", b.color)} />
                    {b.label}
                  </span>
                  <span className="text-muted-foreground">{b.count}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team load</CardTitle>
          <CardDescription>Capacity utilization, last 7 days</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {teamLoad.map((row) => (
            <div key={row.name}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium">{row.name}</span>
                <span className="text-muted-foreground">{row.value}%</span>
              </div>
              <Progress value={row.value} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Delta({ value }: { value: number }) {
  if (value === 0) {
    return <Badge variant="muted">No change</Badge>;
  }
  const up = value > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        up ? "text-success" : "text-destructive",
      )}
    >
      {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(value)}% vs last week
    </span>
  );
}

function Sparkbar({ data }: { data: number[] }) {
  const max = Math.max(...data);
  return (
    <div className="flex h-40 items-end gap-2">
      {data.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-md bg-gradient-to-t from-primary/40 to-primary"
            style={{ height: `${(v / max) * 100}%` }}
          />
          <span className="text-[10px] text-muted-foreground">D{i + 1}</span>
        </div>
      ))}
    </div>
  );
}