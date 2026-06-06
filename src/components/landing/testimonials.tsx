import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";

const testimonials = [
  {
    quote:
      "We killed Notion, Linear, and three Slack integrations the week we rolled out NexusHub. Engineering productivity went up, our SaaS bill went down.",
    name: "Sara Akhtar",
    role: "VP Engineering",
    company: "Northwind",
  },
  {
    quote:
      "The kanban and docs being in the same workspace is a quiet superpower. PMs spec a feature inline; engineers ship without losing context.",
    name: "Marcus Lee",
    role: "Staff Engineer",
    company: "Hyperion Labs",
  },
  {
    quote:
      "Onboarding new hires used to mean granting five SaaS seats. Now it's one invite, one workspace, and they're contributing inside an hour.",
    name: "Priya Iyer",
    role: "Head of Operations",
    company: "Cascade",
  },
];

export function Testimonials() {
  return (
    <section className="border-b py-section">
      <div className="mx-auto max-w-container px-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Loved by teams</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Teams ship more. Tools cost less.
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name}>
              <CardContent className="flex h-full flex-col gap-6 p-6">
                <p className="text-pretty text-base leading-relaxed text-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-auto flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{initials(t.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium leading-tight">{t.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.role} · {t.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}