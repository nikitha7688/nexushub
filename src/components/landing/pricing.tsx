import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Free",
    price: "$0",
    cadence: "per user / month",
    description: "For individuals and tiny teams getting started.",
    features: [
      "Up to 5 users",
      "Unlimited docs & notes",
      "Kanban + calendar",
      "1 GB file storage",
      "Community support",
    ],
    cta: "Start free",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$9",
    cadence: "per user / month",
    description: "For growing teams that need real collaboration.",
    features: [
      "Unlimited users",
      "Version history & templates",
      "Real-time mentions & comments",
      "100 GB file storage",
      "Priority support",
      "SSO (Google, Microsoft)",
    ],
    cta: "Start 30-day trial",
    href: "/signup?plan=pro",
    highlight: true,
  },
  {
    name: "Business",
    price: "$19",
    cadence: "per user / month",
    description: "For orgs that need security, audit, and scale.",
    features: [
      "Everything in Pro",
      "SAML SSO + SCIM",
      "Audit logs & retention",
      "1 TB file storage",
      "99.9% uptime SLA",
      "Dedicated CSM",
    ],
    cta: "Contact sales",
    href: "/signup?plan=business",
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="border-b bg-muted/30 py-section">
      <div className="mx-auto max-w-container px-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Pricing</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Simple pricing. No surprises.
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Pay only for active users. Cancel anytime. All plans include unlimited workspaces.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-card p-6 shadow-soft",
                t.highlight && "border-primary shadow-glow",
              )}
            >
              {t.highlight && (
                <Badge className="absolute -top-3 left-6">Most popular</Badge>
              )}
              <h3 className="text-lg font-semibold">{t.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">{t.price}</span>
                <span className="text-sm text-muted-foreground">{t.cadence}</span>
              </div>
              <ul className="mt-6 space-y-2.5">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="mt-8 w-full"
                variant={t.highlight ? "default" : "outline"}
                asChild
              >
                <Link href={t.href}>{t.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}