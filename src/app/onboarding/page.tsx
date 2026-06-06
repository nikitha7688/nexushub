"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Folder,
  Laptop,
  ListTodo,
  Loader2,
  Monitor,
  Moon,
  Plus,
  StickyNote,
  Sun,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type FeatureId = "docs" | "notes" | "tasks" | "collab" | "files";
type Role = "Admin" | "Manager" | "Developer" | "Viewer";

interface InviteRow {
  email: string;
  role: Role;
}

const steps = ["Workspace", "Features", "Invite team", "Theme"] as const;

type IconComponent = React.ComponentType<{ className?: string }>;

const FEATURES: { id: FeatureId; title: string; description: string; icon: IconComponent }[] = [
  { id: "docs", title: "Documentation", description: "Rich text, markdown, templates, version history.", icon: FileText },
  { id: "notes", title: "Notes", description: "Personal, team, and meeting notes with auto-save.", icon: StickyNote },
  { id: "tasks", title: "Tasks", description: "Kanban + calendar with assignees and priorities.", icon: ListTodo },
  { id: "collab", title: "Collaboration", description: "Mentions, comments, threads, activity feed.", icon: Users },
  { id: "files", title: "Files", description: "Grid + list views, previews, R2-backed storage.", icon: Folder },
];

const TEAM_SIZES = ["Just me", "2–10", "11–50", "51–200", "200+"];
const DEPARTMENTS = ["Engineering", "Product", "Design", "Marketing", "Sales", "Operations", "Other"];
const ROLES: Role[] = ["Admin", "Manager", "Developer", "Viewer"];

export default function OnboardingPage() {
  const router = useRouter();
  const { setTheme } = useTheme();

  const [step, setStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  // Step 1
  const [workspaceName, setWorkspaceName] = React.useState("");
  const [teamSize, setTeamSize] = React.useState<string>("");
  const [department, setDepartment] = React.useState<string>("");

  // Step 2
  const [selected, setSelected] = React.useState<Set<FeatureId>>(
    new Set(["docs", "notes", "tasks", "collab", "files"]),
  );

  // Step 3
  const [invites, setInvites] = React.useState<InviteRow[]>([
    { email: "", role: "Developer" },
    { email: "", role: "Developer" },
  ]);

  // Step 4
  const [themeChoice, setThemeChoice] = React.useState<"light" | "dark" | "system">("system");

  function toggleFeature(id: FeatureId) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function updateInvite(i: number, patch: Partial<InviteRow>) {
    setInvites((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function addInviteRow() {
    setInvites((prev) => [...prev, { email: "", role: "Developer" }]);
  }

  function removeInviteRow(i: number) {
    setInvites((prev) => prev.filter((_, idx) => idx !== i));
  }

  function next() {
    if (step === 0) {
      if (!workspaceName.trim() || !teamSize || !department) {
        toast.error("Please fill out all fields");
        return;
      }
    }
    if (step === 1 && selected.size === 0) {
      toast.error("Pick at least one feature");
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function finish() {
    setTheme(themeChoice);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Workspace ready");
      router.push("/dashboard");
    }, 800);
  }

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-page">
          <Brand />
          <p className="text-xs text-muted-foreground">
            Step {step + 1} of {steps.length}
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl px-page py-10">
        {/* Progress */}
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            {steps.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold",
                    i < step
                      ? "border-primary bg-primary text-primary-foreground"
                      : i === step
                        ? "border-primary text-primary"
                        : "border-border text-muted-foreground",
                  )}
                >
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "hidden text-sm font-medium sm:block",
                    i === step ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-8 shadow-soft">
          {step === 0 && (
            <StepWorkspace
              workspaceName={workspaceName}
              setWorkspaceName={setWorkspaceName}
              teamSize={teamSize}
              setTeamSize={setTeamSize}
              department={department}
              setDepartment={setDepartment}
            />
          )}
          {step === 1 && (
            <StepFeatures selected={selected} toggle={toggleFeature} />
          )}
          {step === 2 && (
            <StepInvites
              invites={invites}
              update={updateInvite}
              add={addInviteRow}
              remove={removeInviteRow}
            />
          )}
          {step === 3 && (
            <StepTheme value={themeChoice} onChange={setThemeChoice} />
          )}

          <div className="mt-8 flex items-center justify-between border-t pt-6">
            <Button
              variant="ghost"
              onClick={back}
              disabled={step === 0}
              className={cn(step === 0 && "invisible")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={next}>
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={finish} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Enter workspace
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepWorkspace({
  workspaceName,
  setWorkspaceName,
  teamSize,
  setTeamSize,
  department,
  setDepartment,
}: {
  workspaceName: string;
  setWorkspaceName: (v: string) => void;
  teamSize: string;
  setTeamSize: (v: string) => void;
  department: string;
  setDepartment: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Set up your workspace</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A few details so we can tailor NexusHub to your team.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ws-name">Workspace name</Label>
        <Input
          id="ws-name"
          autoFocus
          placeholder="Acme HQ"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Team size</Label>
          <Select value={teamSize} onValueChange={setTeamSize}>
            <SelectTrigger>
              <SelectValue placeholder="Pick a range" />
            </SelectTrigger>
            <SelectContent>
              {TEAM_SIZES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Department</Label>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger>
              <SelectValue placeholder="Pick a department" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function StepFeatures({
  selected,
  toggle,
}: {
  selected: Set<FeatureId>;
  toggle: (id: FeatureId) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">What will your team use?</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Toggle the modules on. You can always enable more later from settings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FEATURES.map((f) => {
          const on = selected.has(f.id);
          const Icon = f.icon;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => toggle(f.id)}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
                on
                  ? "border-primary bg-primary/5 shadow-soft"
                  : "border-border hover:bg-accent/30",
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">{f.title}</h3>
                  <div
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border",
                      on ? "border-primary bg-primary text-primary-foreground" : "border-border",
                    )}
                  >
                    {on && <Check className="h-3 w-3" />}
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{f.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepInvites({
  invites,
  update,
  add,
  remove,
}: {
  invites: InviteRow[];
  update: (i: number, patch: Partial<InviteRow>) => void;
  add: () => void;
  remove: (i: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Invite your team</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You can skip this and invite people later from{" "}
          <span className="font-medium text-foreground">Settings → Team</span>.
        </p>
      </div>

      <div className="space-y-2">
        {invites.map((row, i) => (
          <div key={i} className="grid grid-cols-12 items-center gap-2">
            <Input
              type="email"
              placeholder="teammate@company.com"
              value={row.email}
              onChange={(e) => update(i, { email: e.target.value })}
              className="col-span-7"
            />
            <div className="col-span-4">
              <Select
                value={row.role}
                onValueChange={(v) => update(i, { role: v as Role })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="col-span-1"
              onClick={() => remove(i)}
              disabled={invites.length === 1}
              aria-label="Remove row"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="h-4 w-4" />
        Add another
      </Button>

      <div className="rounded-md border border-dashed bg-muted/30 p-4 text-xs text-muted-foreground">
        <p>
          <span className="font-semibold text-foreground">Admin</span> — full control.{" "}
          <span className="font-semibold text-foreground">Manager</span> — manage docs/tasks &amp;
          invite members.{" "}
          <span className="font-semibold text-foreground">Developer</span> — create &amp; edit.{" "}
          <span className="font-semibold text-foreground">Viewer</span> — read-only.
        </p>
      </div>
    </div>
  );
}

function StepTheme({
  value,
  onChange,
}: {
  value: "light" | "dark" | "system";
  onChange: (v: "light" | "dark" | "system") => void;
}) {
  const options = [
    { id: "light" as const, label: "Light", icon: Sun, preview: "bg-white border-zinc-200" },
    { id: "dark" as const, label: "Dark", icon: Moon, preview: "bg-zinc-900 border-zinc-800" },
    { id: "system" as const, label: "System", icon: Monitor, preview: "bg-gradient-to-br from-white to-zinc-900 border-zinc-300" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pick your look</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You can change this anytime from Settings → Appearance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {options.map((o) => {
          const Icon = o.icon;
          const on = value === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              className={cn(
                "flex flex-col items-stretch gap-3 rounded-xl border p-3 text-left transition-all",
                on ? "border-primary shadow-glow" : "hover:bg-accent/30",
              )}
            >
              <div className={cn("h-24 w-full rounded-md border", o.preview)} />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Icon className="h-4 w-4" />
                  {o.label}
                </div>
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border",
                    on ? "border-primary bg-primary text-primary-foreground" : "border-border",
                  )}
                >
                  {on && <Check className="h-3 w-3" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-md border bg-muted/30 p-4 text-xs text-muted-foreground">
        <p className="flex items-center gap-2">
          <Laptop className="h-3.5 w-3.5" />
          System matches your OS&apos;s light/dark preference and updates automatically.
        </p>
      </div>
    </div>
  );
}