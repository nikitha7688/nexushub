"use client";

import * as React from "react";
import { FilePlus, FileText, Layers, Plus } from "lucide-react";
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
import { DOC_TEMPLATES, type DocTemplate } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface TemplatesDialogProps {
  onPick: (template: DocTemplate) => void;
}

export function TemplatesDialog({ onPick }: TemplatesDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<DocTemplate>(DOC_TEMPLATES[0]);

  function pick() {
    onPick(selected);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          New document
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Choose a template
          </DialogTitle>
          <DialogDescription>
            Templates seed the doc with a structured outline you can edit.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {DOC_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelected(t)}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                selected.id === t.id
                  ? "border-primary bg-primary/[0.04]"
                  : "hover:bg-accent/40",
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
                  selected.id === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {t.id === "blank" ? <FilePlus className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">{t.title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>
              </div>
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={pick}>Use template</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}