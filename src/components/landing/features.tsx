import { FileText, ListTodo, Users, StickyNote, Folder, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: FileText,
    title: "Documentation",
    description:
      "Rich text editor with markdown, code blocks, templates, and version history — built for engineering teams.",
  },
  {
    icon: ListTodo,
    title: "Tasks",
    description:
      "Kanban boards, calendar views, priorities, assignees, and due dates. Drag, drop, ship.",
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "Mentions, comments, threads, and a real-time activity feed for the whole team.",
  },
  {
    icon: StickyNote,
    title: "Notes",
    description:
      "Personal, team, and meeting notes with auto-save, pinning, and instant cross-workspace search.",
  },
  {
    icon: Folder,
    title: "Files",
    description:
      "Grid + list views, folder navigation, previews for images/PDF/video, and S3-compatible storage.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Workspace activity, task throughput, document velocity, and team load in one view.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-b py-section">
      <div className="mx-auto max-w-container px-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Everything in one place</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Six tools. One workspace. Zero context switching.
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Stop stitching together five SaaS subscriptions. NexusHub does the work of Notion + Linear
            + Slack + Drive — without the integration hell.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="transition-shadow hover:shadow-elevated">
              <CardHeader>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{f.title}</CardTitle>
                <CardDescription>{f.description}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}