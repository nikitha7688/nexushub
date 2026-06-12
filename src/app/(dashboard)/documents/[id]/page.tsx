"use client";

import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  History,
  MoreHorizontal,
  Share2,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { DocumentEditor } from "@/components/documents/document-editor";
import { VersionHistory } from "@/components/documents/version-history";
import { CommentsThread, type Comment } from "@/components/collab/comments-thread";
import {
  CURRENT_USER,
  DOCUMENTS,
  DOC_BODIES,
  DOC_COMMENTS,
  DOC_VERSIONS,
  findPerson,
} from "@/lib/mock-data";
import { initials, cn } from "@/lib/utils";

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const doc = DOCUMENTS.find((d) => d.id === id);
  if (!doc) notFound();

  const author = findPerson(doc.authorId);
  const versions = DOC_VERSIONS[doc.id] ?? [];

  const [title, setTitle] = React.useState(doc.title);
  const [body, setBody] = React.useState(DOC_BODIES[doc.id] ?? `# ${doc.title}\n\n${doc.excerpt}`);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [comments, setComments] = React.useState<Comment[]>(
    DOC_COMMENTS.filter((c) => c.docId === doc.id).map((c) => ({
      id: c.id,
      authorId: c.authorId,
      body: c.body,
      createdAt: c.createdAt,
      parentId: c.parentId,
    })),
  );

  function addComment(body: string, parentId?: string) {
    setComments((prev) => [
      ...prev,
      {
        id: `c_${Date.now()}`,
        authorId: CURRENT_USER.id,
        body,
        createdAt: new Date().toISOString(),
        parentId,
      },
    ]);
  }

  return (
    <div className="space-y-4">
      <Link
        href="/documents"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All documents
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-2xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground"
            placeholder="Untitled"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">{doc.category}</Badge>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Updated {doc.updatedAt}
            </span>
            {author && (
              <span className="flex items-center gap-1.5">
                <Avatar className="h-4 w-4">
                  <AvatarFallback className="text-[8px]">{initials(author.name)}</AvatarFallback>
                </Avatar>
                {author.name}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={historyOpen ? "secondary" : "outline"}
            size="sm"
            onClick={() => setHistoryOpen((v) => !v)}
          >
            <History className="h-4 w-4" />
            History
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.success("Link copied")}>
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="ghost" size="icon" aria-label="More">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Favorite">
            <Star className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator />

      <div className={cn("grid grid-cols-1 gap-6", historyOpen && "lg:grid-cols-[1fr_320px]")}>
        <div className="min-w-0">
          <DocumentEditor value={body} onChange={setBody} />
          <p className="mt-2 text-xs text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-success align-middle" />{" "}
            Auto-saved · synced just now
          </p>
        </div>

        {historyOpen && (
          <aside>
            <VersionHistory
              versions={versions}
              onRestore={(id) => toast.success(`Restored version ${id}`)}
            />
          </aside>
        )}
      </div>

      <Separator />

      <CommentsThread comments={comments} onAdd={addComment} />
    </div>
  );
}