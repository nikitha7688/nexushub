"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileText, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TemplatesDialog } from "@/components/documents/templates-dialog";
import { DOC_CATEGORIES, DOCUMENTS, findPerson } from "@/lib/mock-data";
import { initials, cn } from "@/lib/utils";

export default function DocumentsPage() {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string | null>(null);

  const filtered = DOCUMENTS.filter((d) => {
    if (category && d.category !== category) return false;
    if (query && !d.title.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
      <aside className="space-y-4">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Categories</h2>
          <nav className="mt-2 space-y-0.5">
            <CategoryItem active={category === null} onClick={() => setCategory(null)}>
              All
            </CategoryItem>
            {DOC_CATEGORIES.map((c) => (
              <CategoryItem key={c} active={category === c} onClick={() => setCategory(c)}>
                {c}
              </CategoryItem>
            ))}
          </nav>
        </div>
      </aside>

      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
            <p className="text-sm text-muted-foreground">
              {filtered.length} doc{filtered.length === 1 ? "" : "s"}
              {category ? ` in ${category}` : ""}
            </p>
          </div>
          <TemplatesDialog
            onPick={(t) => {
              toast.success(`Started doc from "${t.title}"`);
              router.push(`/documents/${DOCUMENTS[0].id}`);
            }}
          />
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search documents…"
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((d) => {
            const author = findPerson(d.authorId);
            return (
              <Link key={d.id} href={`/documents/${d.id}`}>
                <Card className="cursor-pointer p-card transition-shadow hover:shadow-elevated">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <Badge variant="outline">{d.category}</Badge>
                  </div>
                  <h3 className="text-base font-semibold">{d.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{d.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px]">
                          {author ? initials(author.name) : ""}
                        </AvatarFallback>
                      </Avatar>
                      <span>{author?.name}</span>
                    </div>
                    <span>{d.updatedAt}</span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CategoryItem({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "block w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors",
        active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}