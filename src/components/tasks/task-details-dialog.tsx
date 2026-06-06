"use client";

import * as React from "react";
import { Calendar, Tag, User } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PEOPLE, type Task } from "@/lib/mock-data";

interface TaskDetailsDialogProps {
  task: Task | null;
  onClose: () => void;
  onSave: (task: Task) => void;
}

export function TaskDetailsDialog({ task, onClose, onSave }: TaskDetailsDialogProps) {
  const [draft, setDraft] = React.useState<Task | null>(task);

  React.useEffect(() => {
    setDraft(task);
  }, [task]);

  if (!draft) return null;

  function update<K extends keyof Task>(key: K, value: Task[K]) {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  }

  function handleSave() {
    if (!draft) return;
    onSave(draft);
    toast.success("Task saved");
    onClose();
  }

  return (
    <Dialog open={!!task} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Task details</DialogTitle>
          <DialogDescription>
            Edit the task — changes save when you click <span className="font-medium">Save</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={draft.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={draft.status} onValueChange={(v) => update("status", v as Task["status"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To do</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="review">In review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select
                value={draft.priority}
                onValueChange={(v) => update("priority", v as Task["priority"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Assignee
              </Label>
              <Select value={draft.assigneeId} onValueChange={(v) => update("assigneeId", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PEOPLE.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="due" className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Due date
              </Label>
              <Input
                id="due"
                type="date"
                value={draft.dueDate}
                onChange={(e) => update("dueDate", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tag" className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              Tag
            </Label>
            <Input
              id="tag"
              value={draft.tag ?? ""}
              onChange={(e) => update("tag", e.target.value)}
              placeholder="e.g. frontend"
            />
            {draft.tag && (
              <div className="pt-1">
                <Badge variant="outline">{draft.tag}</Badge>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Add more context, links, or acceptance criteria…"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}