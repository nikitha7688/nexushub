"use client";

import {
  Download,
  ExternalLink,
  File as FileIcon,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Play,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { findPerson, formatBytes, type FileItem } from "@/lib/mock-data";

interface FilePreviewDialogProps {
  file: FileItem | null;
  onClose: () => void;
}

export function FilePreviewDialog({ file, onClose }: FilePreviewDialogProps) {
  if (!file) return null;
  const owner = findPerson(file.ownerId);

  return (
    <Dialog open={!!file} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KindIcon kind={file.kind} />
            {file.name}
          </DialogTitle>
        </DialogHeader>

        <PreviewSurface file={file} />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Badge variant="muted" className="capitalize">
              {file.kind}
            </Badge>
            <span>{formatBytes(file.size)}</span>
            <span>·</span>
            <span>{owner?.name}</span>
            <span>·</span>
            <span>{file.updatedAt}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4" />
              Open
            </Button>
            <Button size="sm">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PreviewSurface({ file }: { file: FileItem }) {
  if (file.kind === "image") {
    return (
      <div className="flex h-72 items-center justify-center rounded-lg border bg-gradient-to-br from-primary/15 via-fuchsia-500/10 to-transparent">
        <ImageIcon className="h-16 w-16 text-primary/50" aria-hidden />
      </div>
    );
  }
  if (file.kind === "video") {
    return (
      <div className="relative flex h-72 items-center justify-center overflow-hidden rounded-lg border bg-zinc-900 text-white">
        <button
          aria-label="Play video"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/25"
        >
          <Play className="h-7 w-7 translate-x-0.5" />
        </button>
        <div className="absolute inset-x-4 bottom-3 flex items-center gap-2">
          <div className="h-1 flex-1 rounded-full bg-white/20">
            <div className="h-full w-1/4 rounded-full bg-primary" />
          </div>
          <span className="text-xs tabular-nums">0:24 / 1:38</span>
        </div>
      </div>
    );
  }
  if (file.kind === "pdf") {
    return (
      <div className="h-72 overflow-hidden rounded-lg border bg-muted/30">
        <div className="flex h-full flex-col items-stretch gap-2 p-6">
          <div className="h-2 w-3/4 rounded bg-foreground/15" />
          <div className="h-2 w-1/2 rounded bg-foreground/15" />
          <div className="mt-4 h-2 w-full rounded bg-foreground/10" />
          <div className="h-2 w-full rounded bg-foreground/10" />
          <div className="h-2 w-11/12 rounded bg-foreground/10" />
          <div className="h-2 w-10/12 rounded bg-foreground/10" />
          <div className="mt-3 h-32 rounded bg-foreground/10" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-72 items-center justify-center rounded-lg border bg-muted/30">
      <div className="text-center">
        <FileIcon className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden />
        <p className="mt-2 text-sm text-muted-foreground">No inline preview for this file type.</p>
      </div>
    </div>
  );
}

function KindIcon({ kind }: { kind: FileItem["kind"] }) {
  const map = {
    image: ImageIcon,
    pdf: FileText,
    video: Play,
    doc: FileText,
    sheet: FileSpreadsheet,
    folder: FileIcon,
  } as const;
  const Icon = map[kind] ?? FileIcon;
  return <Icon className="h-4 w-4 text-muted-foreground" />;
}