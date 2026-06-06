"use client";

import { History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { findPerson, timeAgo, type DocVersion } from "@/lib/mock-data";
import { initials } from "@/lib/utils";

interface VersionHistoryProps {
  versions: DocVersion[];
  onRestore?: (versionId: string) => void;
}

export function VersionHistory({ versions, onRestore }: VersionHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4" />
          Version history
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {versions.length === 0 && (
          <p className="text-sm text-muted-foreground">No versions yet.</p>
        )}
        {versions.map((v, i) => {
          const author = findPerson(v.authorId);
          const latest = i === 0;
          return (
            <div key={v.id} className="rounded-md border p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">
                      {author ? initials(author.name) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{author?.name ?? "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(v.createdAt)}</p>
                  </div>
                </div>
                {latest && <Badge variant="success">Current</Badge>}
              </div>
              <p className="mt-2 text-sm">{v.summary}</p>
              {!latest && onRestore && (
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => onRestore(v.id)}>
                  Restore this version
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}