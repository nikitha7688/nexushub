"use client";

import * as React from "react";
import {
  File as FileIcon,
  FileSpreadsheet,
  FileText,
  Folder,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Plus,
  Upload,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FILES, findPerson, formatBytes, type FileItem } from "@/lib/mock-data";
import { initials, cn } from "@/lib/utils";

type View = "grid" | "list";

const ICONS = {
  folder: Folder,
  image: ImageIcon,
  pdf: FileText,
  video: Video,
  doc: FileText,
  sheet: FileSpreadsheet,
} as const;

export default function FilesPage() {
  const [view, setView] = React.useState<View>("grid");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Files</span>
            <span>/</span>
            <span className="text-foreground">All</span>
          </nav>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">All files</h1>
          <p className="text-sm text-muted-foreground">{FILES.length} items</p>
        </div>
        <div className="flex gap-2">
          <div className="inline-flex rounded-md border p-0.5">
            <button
              onClick={() => setView("grid")}
              className={cn(
                "flex items-center gap-1 rounded px-2 py-1 text-xs font-medium",
                view === "grid" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Grid
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "flex items-center gap-1 rounded px-2 py-1 text-xs font-medium",
                view === "list" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
              aria-label="List view"
            >
              <List className="h-3.5 w-3.5" />
              List
            </button>
          </div>
          <Button variant="outline">
            <Plus className="h-4 w-4" />
            New folder
          </Button>
          <Button>
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>

      {view === "grid" ? <Grid items={FILES} /> : <FileList items={FILES} />}

      <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        <Upload className="mx-auto mb-2 h-5 w-5" />
        Drop files here to upload (UI only — wired in Phase 3).
      </div>
    </div>
  );
}

function Grid({ items }: { items: FileItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((f) => {
        const Icon = ICONS[f.kind] ?? FileIcon;
        const owner = findPerson(f.ownerId);
        return (
          <Card key={f.id} className="cursor-pointer p-4 text-center transition-shadow hover:shadow-elevated">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </div>
            <p className="mt-3 truncate text-sm font-medium" title={f.name}>
              {f.name}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {f.kind === "folder" ? "Folder" : formatBytes(f.size)}
            </p>
            <p className="mt-2 truncate text-[11px] text-muted-foreground">{owner?.name}</p>
          </Card>
        );
      })}
    </div>
  );
}

function FileList({ items }: { items: FileItem[] }) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Modified</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((f) => {
            const Icon = ICONS[f.kind] ?? FileIcon;
            const owner = findPerson(f.ownerId);
            return (
              <TableRow key={f.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{f.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px]">
                        {owner ? initials(owner.name) : ""}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{owner?.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {f.kind === "folder" ? "—" : formatBytes(f.size)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{f.updatedAt}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}