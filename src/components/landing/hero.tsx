import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const highlights = [
  { icon: Zap, label: "Setup in 2 minutes" },
  { icon: ShieldCheck, label: "SOC 2 compliant" },
  { icon: Users, label: "Unlimited guests" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-[500px] max-w-5xl rounded-full bg-primary/15 blur-3xl"
      />
      <div className="mx-auto flex max-w-container flex-col items-center gap-8 px-page pt-section pb-20 text-center">
        <Badge variant="muted" className="gap-1.5 rounded-full px-3 py-1">
          <Sparkles className="h-3.5 w-3.5" />
          Now in beta — try free for 30 days
        </Badge>

        <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          One workspace for{" "}
          <span className="bg-gradient-to-r from-primary to-fuchsia-500 bg-clip-text text-transparent">
            docs, tasks &amp; teams
          </span>
        </h1>

        <p className="max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
          NexusHub combines documentation, notes, tasks, file storage, and team collaboration into one
          productivity platform — so your team stops switching tabs and starts shipping.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/signup">
              Start free
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#how-it-works">See how it works</Link>
          </Button>
        </div>

        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {highlights.map((h) => (
            <li key={h.label} className="flex items-center gap-1.5">
              <h.icon className="h-4 w-4 text-primary" />
              {h.label}
            </li>
          ))}
        </ul>

        <DashboardPreview />
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <div className="relative mt-10 w-full max-w-5xl">
      <div className="absolute -inset-x-8 -inset-y-4 -z-10 rounded-3xl bg-gradient-to-tr from-primary/20 via-fuchsia-500/10 to-transparent blur-2xl" />
      <div className="overflow-hidden rounded-2xl border bg-card shadow-elevated">
        <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
          <div className="ml-3 hidden text-xs text-muted-foreground sm:block">
            app.nexushub.io/dashboard
          </div>
        </div>
        <div className="grid grid-cols-12 gap-4 p-4 sm:p-6">
          <div className="col-span-3 hidden flex-col gap-2 sm:flex">
            {["Dashboard", "Documents", "Notes", "Tasks", "Files", "Team"].map((l, i) => (
              <div
                key={l}
                className={
                  "h-8 rounded-md " +
                  (i === 0 ? "bg-primary/15" : "bg-muted/60")
                }
              />
            ))}
          </div>
          <div className="col-span-12 sm:col-span-9">
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-lg border bg-muted/40" />
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="col-span-2 h-44 rounded-lg border bg-muted/40" />
              <div className="h-44 rounded-lg border bg-muted/40" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}