"use client";

import * as React from "react";
import {
  ChevronRight,
  File as FileIcon,
  FileSpreadsheet,
  FileText,
  Folder,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Plus,
  Video,
} from "lucide-react";
import { toast } from "sonner";
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
import { EmptyState } from "@/components/ui/empty-state";
import { FilePreviewDialog } from "@/components/files/file-preview-dialog";
import { UploadDialog } from "@/components/files/upload-dialog";
import {
  FILES,
  buildFolderPath,
  findPerson,
  formatBytes,
  type FileItem,
} from "@/lib/mock-data";
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
  const [folderId, setFolderId] = React.useState<string | null>(null);
  const [previewing, setPreviewing] = React.useState<FileItem | null>(null);

  const items = FILES.filter((f) => f.parentId === folderId);
  const path = buildFolderPath(FILES, folderId);

  function openItem(item: FileItem) {
    if (item.kind === "folder") {
      setFolderId(item.id);
    } else {
      setPreviewing(item);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Breadcrumbs path={path} onNavigate={setFolderId} />
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {path.length === 0 ? "All files" : path[path.length - 1].name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {items.length} item{items.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex gap-2">
          <ViewToggle view={view} onChange={setView} />
          <Button
            variant="outline"
            onClick={() => toast.success("New folder created (mock)")}
          >
            <Plus className="h-4 w-4" />
            New folder
          </Button>
          <UploadDialog />
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<Folder className="h-5 w-5" />}
          title="This folder is empty"
          description="Drag files into this folder or use Upload to add some."
        />
      ) : view === "grid" ? (
        <Grid items={items} onOpen={openItem} />
      ) : (
        <FileList items={items} onOpen={openItem} />
      )}

      <FilePreviewDialog file={previewing} onClose={() => setPreviewing(null)} />
    </div>
  );
}

function Breadcrumbs({
  path,
  onNavigate,
}: {
  path: FileItem[];
  onNavigate: (id: string | null) => void;
}) {
  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
      <button
        onClick={() => onNavigate(null)}
        className="hover:text-foreground"
      >
        Files
      </button>
      {path.map((p, i) => (
        <React.Fragment key={p.id}>
          <ChevronRight className="h-3.5 w-3.5" />
          <button
            onClick={() => onNavigate(p.id)}
            className={cn(i === path.length - 1 ? "text-foreground" : "hover:text-foreground")}
          >
            {p.name}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
}

function ViewToggle({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return (
    <div className="inline-flex rounded-md border p-0.5">
      <button
        onClick={() => onChange("grid")}
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
        onClick={() => onChange("list")}
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
  );
}

function Grid({ items, onOpen }: { items: FileItem[]; onOpen: (f: FileItem) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((f) => {
        const Icon = ICONS[f.kind] ?? FileIcon;
        const owner = findPerson(f.ownerId);
        return (
          <button
            key={f.id}
            onClick={() => onOpen(f)}
            className="rounded-xl border bg-card p-4 text-center transition-shadow hover:shadow-elevated"
          >
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
          </button>
        );
      })}
    </div>
  );
}

function FileList({ items, onOpen }: { items: FileItem[]; onOpen: (f: FileItem) => void }) {
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
              <TableRow
                key={f.id}
                onClick={() => onOpen(f)}
                className="cursor-pointer"
              >
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