export interface Person {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Developer" | "Viewer";
  department: string;
  joinedAt: string;
}

export const PEOPLE: Person[] = [
  { id: "u1", name: "Ada Lovelace", email: "ada@nexushub.io", role: "Admin", department: "Engineering", joinedAt: "2024-01-08" },
  { id: "u2", name: "Marcus Lee", email: "marcus@nexushub.io", role: "Developer", department: "Engineering", joinedAt: "2024-02-21" },
  { id: "u3", name: "Sara Akhtar", email: "sara@nexushub.io", role: "Manager", department: "Product", joinedAt: "2024-03-15" },
  { id: "u4", name: "Priya Iyer", email: "priya@nexushub.io", role: "Manager", department: "Operations", joinedAt: "2024-04-02" },
  { id: "u5", name: "Diego Ramirez", email: "diego@nexushub.io", role: "Developer", department: "Engineering", joinedAt: "2024-05-19" },
  { id: "u6", name: "Mei Lin", email: "mei@nexushub.io", role: "Developer", department: "Design", joinedAt: "2024-06-04" },
  { id: "u7", name: "Jordan Brooks", email: "jordan@nexushub.io", role: "Viewer", department: "Marketing", joinedAt: "2024-07-11" },
  { id: "u8", name: "Hana Suzuki", email: "hana@nexushub.io", role: "Developer", department: "Engineering", joinedAt: "2024-08-30" },
];

export interface Document {
  id: string;
  title: string;
  category: string;
  authorId: string;
  updatedAt: string;
  excerpt: string;
}

export const DOC_CATEGORIES = ["Engineering", "Product", "Design", "Operations", "HR", "Sales"];

export const DOCUMENTS: Document[] = [
  { id: "d1", title: "Q3 Roadmap", category: "Product", authorId: "u3", updatedAt: "2026-05-22", excerpt: "Goals for the third quarter, ICEs, and the cut list." },
  { id: "d2", title: "Auth service runbook", category: "Engineering", authorId: "u2", updatedAt: "2026-05-31", excerpt: "On-call procedures for the auth service incidents." },
  { id: "d3", title: "Design tokens v2", category: "Design", authorId: "u6", updatedAt: "2026-06-02", excerpt: "Migration plan from v1 → v2 color & typography tokens." },
  { id: "d4", title: "Hiring loop guide", category: "HR", authorId: "u4", updatedAt: "2026-04-29", excerpt: "How to run a great loop: structure, rubrics, debriefs." },
  { id: "d5", title: "R2 storage architecture", category: "Engineering", authorId: "u5", updatedAt: "2026-05-12", excerpt: "Cloudflare R2 buckets, retention, and access patterns." },
  { id: "d6", title: "GTM playbook — Pro tier", category: "Sales", authorId: "u7", updatedAt: "2026-05-25", excerpt: "Positioning, objections, and the deal desk process." },
  { id: "d7", title: "Incident retro: 2026-05-18", category: "Operations", authorId: "u4", updatedAt: "2026-05-20", excerpt: "Root cause, contributing factors, action items." },
  { id: "d8", title: "Onboarding checklist", category: "HR", authorId: "u4", updatedAt: "2026-03-18", excerpt: "Day-1, week-1, month-1 milestones for new hires." },
];

export interface Note {
  id: string;
  title: string;
  type: "personal" | "team" | "meeting";
  excerpt: string;
  updatedAt: string;
  pinned: boolean;
}

export const NOTES: Note[] = [
  { id: "n1", title: "Standup parking lot", type: "team", excerpt: "Topics to revisit: index migration, design review cadence.", updatedAt: "2026-06-04", pinned: true },
  { id: "n2", title: "1:1 prep — Sara", type: "personal", excerpt: "Career framework questions, blockers, scope.", updatedAt: "2026-06-03", pinned: false },
  { id: "n3", title: "Q3 planning meeting", type: "meeting", excerpt: "Attendees: leads. Outcome: locked top-3 OKRs.", updatedAt: "2026-06-01", pinned: true },
  { id: "n4", title: "Reading list", type: "personal", excerpt: "Articles and books to read this quarter.", updatedAt: "2026-05-29", pinned: false },
  { id: "n5", title: "Design crit notes", type: "team", excerpt: "Notes from Tuesday's design crit on the new editor.", updatedAt: "2026-05-28", pinned: false },
  { id: "n6", title: "Customer interview — Northwind", type: "meeting", excerpt: "Pain points: tab-switching, search.", updatedAt: "2026-05-27", pinned: false },
];

export interface Task {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high";
  assigneeId: string;
  dueDate: string;
  tag?: string;
}

export const TASKS: Task[] = [
  { id: "t1", title: "Wire up React Query for documents", status: "in_progress", priority: "high", assigneeId: "u2", dueDate: "2026-06-09", tag: "frontend" },
  { id: "t2", title: "R2 bucket retention policy", status: "todo", priority: "medium", assigneeId: "u5", dueDate: "2026-06-12", tag: "infra" },
  { id: "t3", title: "Migrate design tokens to v2", status: "review", priority: "medium", assigneeId: "u6", dueDate: "2026-06-08", tag: "design" },
  { id: "t4", title: "OAuth Microsoft callback bug", status: "todo", priority: "high", assigneeId: "u8", dueDate: "2026-06-07", tag: "bug" },
  { id: "t5", title: "Update onboarding copy", status: "done", priority: "low", assigneeId: "u3", dueDate: "2026-06-02", tag: "copy" },
  { id: "t6", title: "Audit pricing page CTAs", status: "in_progress", priority: "low", assigneeId: "u7", dueDate: "2026-06-11", tag: "marketing" },
  { id: "t7", title: "Add CSV export to tasks", status: "todo", priority: "medium", assigneeId: "u2", dueDate: "2026-06-15", tag: "feature" },
  { id: "t8", title: "Permission audit — Viewer role", status: "review", priority: "high", assigneeId: "u4", dueDate: "2026-06-08", tag: "security" },
  { id: "t9", title: "Hire EM (Platform)", status: "in_progress", priority: "high", assigneeId: "u4", dueDate: "2026-06-30", tag: "hiring" },
  { id: "t10", title: "Q3 OKR review with leads", status: "done", priority: "medium", assigneeId: "u3", dueDate: "2026-05-31", tag: "ops" },
  { id: "t11", title: "Reduce dashboard bundle by 20%", status: "todo", priority: "low", assigneeId: "u5", dueDate: "2026-06-20", tag: "perf" },
  { id: "t12", title: "Draft Series B narrative", status: "done", priority: "high", assigneeId: "u3", dueDate: "2026-05-28", tag: "deck" },
];

export interface FileItem {
  id: string;
  name: string;
  kind: "image" | "pdf" | "video" | "doc" | "sheet" | "folder";
  size: number; // bytes
  updatedAt: string;
  ownerId: string;
}

export const FILES: FileItem[] = [
  { id: "f1", name: "Brand guidelines", kind: "folder", size: 0, updatedAt: "2026-06-03", ownerId: "u6" },
  { id: "f2", name: "Q3 roadmap", kind: "folder", size: 0, updatedAt: "2026-05-25", ownerId: "u3" },
  { id: "f3", name: "hero-illustration.png", kind: "image", size: 4_200_000, updatedAt: "2026-06-01", ownerId: "u6" },
  { id: "f4", name: "investor-deck-v3.pdf", kind: "pdf", size: 12_500_000, updatedAt: "2026-05-28", ownerId: "u3" },
  { id: "f5", name: "product-tour.mp4", kind: "video", size: 88_300_000, updatedAt: "2026-05-19", ownerId: "u7" },
  { id: "f6", name: "Q2-financials.xlsx", kind: "sheet", size: 220_000, updatedAt: "2026-05-12", ownerId: "u4" },
  { id: "f7", name: "incident-2026-05-18.md", kind: "doc", size: 18_000, updatedAt: "2026-05-20", ownerId: "u4" },
  { id: "f8", name: "logo-mark.svg", kind: "image", size: 14_000, updatedAt: "2026-04-15", ownerId: "u6" },
];

export interface NotificationItem {
  id: string;
  type: "mention" | "task" | "alert";
  actorId?: string;
  message: string;
  href: string;
  createdAt: string;
  read: boolean;
}

export const NOTIFICATIONS: NotificationItem[] = [
  { id: "no1", type: "mention", actorId: "u3", message: "Sara mentioned you in “Q3 Roadmap”", href: "/documents/d1", createdAt: "2026-06-06T08:42:00Z", read: false },
  { id: "no2", type: "task", actorId: "u4", message: "Priya assigned you “OAuth Microsoft callback bug”", href: "/tasks/t4", createdAt: "2026-06-06T07:10:00Z", read: false },
  { id: "no3", type: "alert", message: "R2 bucket 'nexus-prod' is 82% full", href: "/files", createdAt: "2026-06-05T22:01:00Z", read: false },
  { id: "no4", type: "mention", actorId: "u6", message: "Mei commented on “Design tokens v2”", href: "/documents/d3", createdAt: "2026-06-05T16:30:00Z", read: true },
  { id: "no5", type: "task", actorId: "u2", message: "Marcus moved “Wire up React Query” to In progress", href: "/tasks/t1", createdAt: "2026-06-05T14:20:00Z", read: true },
  { id: "no6", type: "alert", message: "Scheduled maintenance window: Sat 06:00 UTC", href: "#", createdAt: "2026-06-04T09:15:00Z", read: true },
  { id: "no7", type: "mention", actorId: "u5", message: "Diego replied in “R2 storage architecture”", href: "/documents/d5", createdAt: "2026-06-03T11:42:00Z", read: true },
];

export const CURRENT_USER = PEOPLE[0];

// Helpers
export function findPerson(id?: string) {
  return PEOPLE.find((p) => p.id === id);
}

export function formatBytes(bytes: number) {
  if (bytes === 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  return `${w}w ago`;
}