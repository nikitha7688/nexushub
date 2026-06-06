import Link from "next/link";
import { Mail, Globe, MessageCircle } from "lucide-react";
import { Brand } from "@/components/brand";

const columns = [
  {
    heading: "Product",
    links: [
      { href: "#features", label: "Features" },
      { href: "#how-it-works", label: "How it works" },
      { href: "#pricing", label: "Pricing" },
      { href: "/changelog", label: "Changelog" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/careers", label: "Careers" },
      { href: "/contact", label: "Contact" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { href: "/docs", label: "Documentation" },
      { href: "/guides", label: "Guides" },
      { href: "/api", label: "API reference" },
      { href: "/status", label: "Status" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/security", label: "Security" },
      { href: "/dpa", label: "DPA" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-background">
      <div className="mx-auto max-w-container px-page py-16">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 lg:col-span-2">
            <Brand />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              One workspace for docs, tasks &amp; teams. Built so your team can stop switching tabs
              and start shipping.
            </p>
            <div className="mt-5 flex gap-2 text-muted-foreground">
              <a
                href="mailto:hello@nexushub.io"
                aria-label="Email"
                className="flex h-9 w-9 items-center justify-center rounded-md border hover:bg-accent hover:text-foreground"
              >
                <Mail className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Website"
                className="flex h-9 w-9 items-center justify-center rounded-md border hover:bg-accent hover:text-foreground"
              >
                <Globe className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Community"
                className="flex h-9 w-9 items-center justify-center rounded-md border hover:bg-accent hover:text-foreground"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="text-sm font-semibold">{col.heading}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} NexusHub Inc. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">Made with care for fast-moving teams.</p>
        </div>
      </div>
    </footer>
  );
}