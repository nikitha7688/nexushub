"use client";

import * as React from "react";
import { MessageCircle, Reply, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MentionInput, renderMentions } from "@/components/collab/mention-input";
import { CURRENT_USER, findPerson, timeAgo } from "@/lib/mock-data";
import { initials } from "@/lib/utils";

export interface Comment {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
  parentId?: string;
}

interface CommentsThreadProps {
  comments: Comment[];
  onAdd: (body: string, parentId?: string) => void;
}

export function CommentsThread({ comments, onAdd }: CommentsThreadProps) {
  const [draft, setDraft] = React.useState("");
  const [replyTo, setReplyTo] = React.useState<string | null>(null);
  const [replyDraft, setReplyDraft] = React.useState("");

  const top = comments.filter((c) => !c.parentId);
  const repliesOf = (id: string) => comments.filter((c) => c.parentId === id);

  function submit() {
    if (!draft.trim()) return;
    onAdd(draft.trim());
    setDraft("");
  }

  function submitReply(parentId: string) {
    if (!replyDraft.trim()) return;
    onAdd(replyDraft.trim(), parentId);
    setReplyDraft("");
    setReplyTo(null);
  }

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <MessageCircle className="h-4 w-4" />
        Comments
        <span className="text-xs font-normal text-muted-foreground">({comments.length})</span>
      </h3>

      <div className="space-y-4">
        {top.length === 0 && (
          <p className="text-sm text-muted-foreground">No comments yet. Be the first.</p>
        )}
        {top.map((c) => (
          <div key={c.id} className="space-y-3">
            <CommentRow comment={c} onReply={() => setReplyTo(c.id === replyTo ? null : c.id)} />

            {repliesOf(c.id).length > 0 && (
              <div className="ml-9 space-y-3 border-l pl-4">
                {repliesOf(c.id).map((r) => (
                  <CommentRow key={r.id} comment={r} />
                ))}
              </div>
            )}

            {replyTo === c.id && (
              <div className="ml-9 space-y-2">
                <MentionInput
                  value={replyDraft}
                  onChange={setReplyDraft}
                  placeholder="Write a reply…"
                  rows={2}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setReplyTo(null);
                      setReplyDraft("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={() => submitReply(c.id)} disabled={!replyDraft.trim()}>
                    <Send className="h-3.5 w-3.5" />
                    Reply
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New top-level comment */}
      <div className="space-y-2 border-t pt-4">
        <div className="flex items-start gap-3">
          <Avatar className="mt-0.5 h-8 w-8">
            <AvatarFallback className="text-xs">{initials(CURRENT_USER.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <MentionInput value={draft} onChange={setDraft} />
            <div className="flex justify-end">
              <Button size="sm" onClick={submit} disabled={!draft.trim()}>
                <Send className="h-3.5 w-3.5" />
                Post comment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommentRow({ comment, onReply }: { comment: Comment; onReply?: () => void }) {
  const author = findPerson(comment.authorId);
  return (
    <div className="flex items-start gap-3">
      <Avatar className="mt-0.5 h-8 w-8">
        <AvatarFallback className="text-xs">
          {author ? initials(author.name) : "?"}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{author?.name ?? "Unknown"}</p>
          <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="mt-1 text-sm leading-relaxed">{renderMentions(comment.body)}</p>
        {onReply && (
          <button
            onClick={onReply}
            className="mt-1.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Reply className="h-3 w-3" />
            Reply
          </button>
        )}
      </div>
    </div>
  );
}