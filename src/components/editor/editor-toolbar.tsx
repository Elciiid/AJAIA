"use client";

import { type Editor, useEditorState } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
} from "lucide-react";
import { cn } from "@/lib/utils";

function ToolButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors",
        "hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-40",
        active && "bg-primary/10 text-primary",
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-border" />;
}

export function EditorToolbar({
  editor,
  disabled,
}: {
  editor: Editor;
  disabled?: boolean;
}) {
  // Subscribe to editor state so active/enabled flags stay in sync.
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      h1: e.isActive("heading", { level: 1 }),
      h2: e.isActive("heading", { level: 2 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const d = disabled;

  return (
    <div className="sticky top-14 z-10 flex flex-wrap items-center gap-0.5 border-b bg-background/90 px-2 py-1.5 backdrop-blur">
      <ToolButton
        label="Bold (Ctrl+B)"
        active={state.bold}
        disabled={d}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="size-4" />
      </ToolButton>
      <ToolButton
        label="Italic (Ctrl+I)"
        active={state.italic}
        disabled={d}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="size-4" />
      </ToolButton>
      <ToolButton
        label="Underline (Ctrl+U)"
        active={state.underline}
        disabled={d}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline className="size-4" />
      </ToolButton>

      <Divider />

      <ToolButton
        label="Heading 1"
        active={state.h1}
        disabled={d}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="size-4" />
      </ToolButton>
      <ToolButton
        label="Heading 2"
        active={state.h2}
        disabled={d}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="size-4" />
      </ToolButton>

      <Divider />

      <ToolButton
        label="Bulleted list"
        active={state.bullet}
        disabled={d}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="size-4" />
      </ToolButton>
      <ToolButton
        label="Numbered list"
        active={state.ordered}
        disabled={d}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="size-4" />
      </ToolButton>
      <ToolButton
        label="Quote"
        active={state.quote}
        disabled={d}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="size-4" />
      </ToolButton>

      <Divider />

      <ToolButton
        label="Undo (Ctrl+Z)"
        disabled={d || !state.canUndo}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2 className="size-4" />
      </ToolButton>
      <ToolButton
        label="Redo (Ctrl+Y)"
        disabled={d || !state.canRedo}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2 className="size-4" />
      </ToolButton>
    </div>
  );
}
