"use client";

import * as React from "react";
import { CheckCircle2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatBytes } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface UploadItem {
  id: string;
  name: string;
  size: number;
  progress: number;
  done: boolean;
}

export function UploadDialog() {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<UploadItem[]>([]);
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const timers = React.useRef<Record<string, ReturnType<typeof setInterval>>>({});

  function startUploads(files: File[]) {
    const newItems: UploadItem[] = files.map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      name: f.name,
      size: f.size,
      progress: 0,
      done: false,
    }));
    setItems((prev) => [...prev, ...newItems]);
    newItems.forEach((it) => {
      timers.current[it.id] = setInterval(() => {
        setItems((prev) =>
          prev.map((p) => {
            if (p.id !== it.id || p.done) return p;
            const next = Math.min(p.progress + Math.random() * 18 + 4, 100);
            if (next >= 100) {
              clearInterval(timers.current[it.id]);
              delete timers.current[it.id];
              return { ...p, progress: 100, done: true };
            }
            return { ...p, progress: next };
          }),
        );
      }, 200);
    });
  }

  function cancelUpload(id: string) {
    if (timers.current[id]) {
      clearInterval(timers.current[id]);
      delete timers.current[id];
    }
    setItems((prev) => prev.filter((p) => p.id !== id));
  }

  React.useEffect(() => {
    return () => {
      Object.values(timers.current).forEach(clearInterval);
    };
  }, []);

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      startUploads(Array.from(e.target.files));
      e.target.value = "";
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) {
      startUploads(Array.from(e.dataTransfer.files));
    }
  }

  const allDone = items.length > 0 && items.every((i) => i.done);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4" />
          Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Upload files</DialogTitle>
          <DialogDescription>
            Drag files anywhere on this dialog, or click to browse. Uploads are simulated for now.
          </DialogDescription>
        </DialogHeader>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          className={cn(
            "flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed transition-colors",
            dragging ? "border-primary bg-primary/[0.04]" : "bg-muted/30 hover:bg-muted/50",
          )}
        >
          <Upload className="h-6 w-6 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">Drop files here or click to browse</p>
          <p className="text-xs text-muted-foreground">Up to 100 MB per file.</p>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={onPickFiles}
          />
        </div>

        {items.length > 0 && (
          <div className="space-y-2">
            {items.map((it) => (
              <div key={it.id} className="rounded-md border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{it.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(it.size)}</p>
                  </div>
                  {it.done ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <button
                      onClick={() => cancelUpload(it.id)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Cancel"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Progress value={it.progress} className="mt-2" />
                <p className="mt-1 text-right text-xs text-muted-foreground">
                  {Math.round(it.progress)}%
                </p>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button
            disabled={!allDone}
            onClick={() => {
              toast.success(`${items.length} file${items.length === 1 ? "" : "s"} uploaded`);
              setItems([]);
              setOpen(false);
            }}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}