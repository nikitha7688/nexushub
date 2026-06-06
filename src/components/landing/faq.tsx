import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Can my whole team use the free plan?",
    a: "Yes — the free plan supports up to 5 users with unlimited docs, notes, and tasks. Once you cross 5 active users you'll need to move to Pro.",
  },
  {
    q: "Do you offer SSO?",
    a: "Google and Microsoft SSO are included on Pro. SAML and SCIM provisioning are included on Business.",
  },
  {
    q: "Where is my data stored?",
    a: "Workspace data is stored in encrypted MongoDB clusters and files are stored on Cloudflare R2 with edge caching. SOC 2 Type II report available on request.",
  },
  {
    q: "Can I import from Notion / Confluence / Jira?",
    a: "Notion and Confluence Markdown imports are supported today. Jira project import (issues + statuses) is in beta — contact us if you'd like early access.",
  },
  {
    q: "What happens if I cancel?",
    a: "You can export all docs and notes as Markdown, and tasks as CSV. Your workspace stays read-only for 30 days after cancellation before we delete it.",
  },
  {
    q: "Do you offer a discount for startups or nonprofits?",
    a: "Yes — startups under 2 years old and registered nonprofits get 50% off Pro and Business. Just reach out from a work email and we'll set it up.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="border-b py-section">
      <div className="mx-auto grid max-w-container grid-cols-1 gap-12 px-page lg:grid-cols-3">
        <div className="lg:col-span-1">
          <p className="text-sm font-medium text-primary">FAQ</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Questions, answered.
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Can&apos;t find what you&apos;re looking for? Email{" "}
            <a className="text-foreground underline underline-offset-4" href="mailto:hello@nexushub.io">
              hello@nexushub.io
            </a>
            .
          </p>
        </div>
        <div className="lg:col-span-2">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}