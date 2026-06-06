"use client";

import * as React from "react";
import {
  Bold,
  Code,
  Code2,
  Heading1,
  Heading2,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { renderMarkdown } from "@/lib/markdown";

interface DocumentEditorProps {
  value: string;
  onChange: (v: string) => void;
}

export function DocumentEditor({ value, onChange }: DocumentEditorProps) {
  const ref = React.useRef<HTMLTextAreaElement>(null);

  function wrapSelection(prefix: string, suffix = prefix) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    const next = value.slice(0, start) + prefix + selected + suffix + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = start + prefix.length;
      el.selectionEnd = end + prefix.length;
    });
  }

  function prefixLine(prefix: string) {
    const el = ref.current;
    if (!el) return;
    const pos = el.selectionStart;
    const before = value.slice(0, pos);
    const lineStart = before.lastIndexOf("\n") + 1;
    const next = value.slice(0, lineStart) + prefix + value.slice(lineStart);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = pos + prefix.length;
      el.selectionEnd = pos + prefix.length;
    });
  }

  function insertCodeBlock() {
    const el = ref.current;
    if (!el) return;
    const pos = el.selectionStart;
    const block = "\n```ts\n\n```\n";
    const next = value.slice(0, pos) + block + value.slice(pos);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const caret = pos + 8;
      el.selectionStart = caret;
      el.selectionEnd = caret;
    });
  }

  return (
    <Tabs defaultValue="write" className="flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <Toolbar
          onBold={() => wrapSelection("**")}
          onItalic={() => wrapSelection("*")}
          onCode={() => wrapSelection("`")}
          onH1={() => prefixLine("# ")}
          onH2={() => prefixLine("## ")}
          onQuote={() => prefixLine("> ")}
          onUL={() => prefixLine("- ")}
          onOL={() => prefixLine("1. ")}
          onLink={() => wrapSelection("[", "](https://)")}
          onCodeBlock={insertCodeBlock}
        />
        <TabsList>
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="write" className="mt-3">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck
          className={cn(
            "min-h-[480px] w-full rounded-lg border bg-background p-4 font-mono text-sm leading-relaxed",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          )}
        />
      </TabsContent>

      <TabsContent value="preview" className="mt-3">
        <div
          className="prose-doc min-h-[480px] rounded-lg border bg-background p-6 text-sm"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
        />
      </TabsContent>
    </Tabs>
  );
}

interface ToolbarProps {
  onBold: () => void;
  onItalic: () => void;
  onCode: () => void;
  onH1: () => void;
  onH2: () => void;
  onQuote: () => void;
  onUL: () => void;
  onOL: () => void;
  onLink: () => void;
  onCodeBlock: () => void;
}

function Toolbar({
  onBold,
  onItalic,
  onCode,
  onH1,
  onH2,
  onQuote,
  onUL,
  onOL,
  onLink,
  onCodeBlock,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 rounded-md border p-0.5">
      <TbBtn label="Heading 1" onClick={onH1}>
        <Heading1 className="h-4 w-4" />
      </TbBtn>
      <TbBtn label="Heading 2" onClick={onH2}>
        <Heading2 className="h-4 w-4" />
      </TbBtn>
      <Divider />
      <TbBtn label="Bold" onClick={onBold}>
        <Bold className="h-4 w-4" />
      </TbBtn>
      <TbBtn label="Italic" onClick={onItalic}>
        <Italic className="h-4 w-4" />
      </TbBtn>
      <TbBtn label="Inline code" onClick={onCode}>
        <Code className="h-4 w-4" />
      </TbBtn>
      <Divider />
      <TbBtn label="Bulleted list" onClick={onUL}>
        <List className="h-4 w-4" />
      </TbBtn>
      <TbBtn label="Numbered list" onClick={onOL}>
        <ListOrdered className="h-4 w-4" />
      </TbBtn>
      <TbBtn label="Quote" onClick={onQuote}>
        <Quote className="h-4 w-4" />
      </TbBtn>
      <TbBtn label="Link" onClick={onLink}>
        <LinkIcon className="h-4 w-4" />
      </TbBtn>
      <TbBtn label="Code block" onClick={onCodeBlock}>
        <Code2 className="h-4 w-4" />
      </TbBtn>
    </div>
  );
}

function TbBtn({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-0.5 h-5 w-px bg-border" aria-hidden />;
}