"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EditorContent, useEditor } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Cloud,
  CloudOff,
  Loader2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TopBar } from "@/components/top-bar";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
import { ShareDialog } from "@/components/share-dialog";
import { editorExtensions } from "@/lib/editor-extensions";
import { api } from "@/lib/fetcher";
import type { FullDocument, SessionUser } from "@/lib/types";

type SaveState = "saved" | "saving" | "unsaved" | "error";
const AUTOSAVE_MS = 700;

export function DocumentEditor({
  id,
  user,
}: {
  id: string;
  user: SessionUser;
}) {
  const router = useRouter();
  const [doc, setDoc] = useState<FullDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("saved");

  const titleRef = useRef("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canEditRef = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      ...editorExtensions,
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    editable: false,
    editorProps: {
      attributes: { class: "focus:outline-none" },
    },
    onUpdate: () => scheduleSave(),
  });

  const doSave = useCallback(async () => {
    if (!editor || !canEditRef.current) return;
    setSaveState("saving");
    try {
      await api(`/api/documents/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: titleRef.current.trim() || "Untitled document",
          content: editor.getJSON(),
        }),
      });
      setSaveState("saved");
    } catch (err) {
      setSaveState("error");
      toast.error(err instanceof Error ? err.message : "Failed to save.");
    }
  }, [editor, id]);

  const scheduleSave = useCallback(() => {
    if (!canEditRef.current) return;
    setSaveState("unsaved");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(doSave, AUTOSAVE_MS);
  }, [doSave]);

  // Load the document once the editor instance exists.
  useEffect(() => {
    if (!editor) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await api<FullDocument>(`/api/documents/${id}`);
        if (cancelled) return;
        setDoc(data);
        setTitle(data.title);
        titleRef.current = data.title;
        canEditRef.current = data.canEdit;
        // emitUpdate:false so loading the document doesn't trigger an autosave.
        editor.commands.setContent(data.content as object, { emitUpdate: false });
        editor.setEditable(data.canEdit);
      } catch (err) {
        if (!cancelled)
          setLoadError(err instanceof Error ? err.message : "Failed to load.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editor, id]);

  // Flush a pending save when leaving the page.
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  function onTitleChange(value: string) {
    setTitle(value);
    titleRef.current = value;
    scheduleSave();
  }

  if (loadError) {
    return (
      <>
        <TopBar user={user} />
        <main className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-4 text-center">
          <CloudOff className="mb-3 size-8 text-muted-foreground" />
          <h1 className="text-lg font-medium">{loadError}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You may not have access to this document, or it may have been deleted.
          </p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/">
              <ArrowLeft className="size-4" /> Back to documents
            </Link>
          </Button>
        </main>
      </>
    );
  }

  const canEdit = doc?.canEdit ?? false;
  const isOwner = doc?.accessLevel === "owner";

  return (
    <>
      <TopBar user={user}>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground"
          >
            <Link href="/" aria-label="Back to documents">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          {loading ? (
            <Skeleton className="h-7 w-48" />
          ) : (
            <input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              disabled={!canEdit}
              placeholder="Untitled document"
              className="min-w-0 flex-1 truncate bg-transparent text-base font-medium outline-none placeholder:text-muted-foreground disabled:cursor-default"
            />
          )}
          <SaveIndicator state={saveState} canEdit={canEdit} loading={loading} />
        </div>
        {!loading && doc && (
          <div className="ml-2 flex shrink-0 items-center gap-2">
            {!canEdit && (
              <Badge variant="secondary" className="gap-1">
                <Eye className="size-3" /> View only
              </Badge>
            )}
            {isOwner && (
              <ShareDialog
                documentId={id}
                ownerEmail={user.email}
                initialShares={doc.shares}
              />
            )}
          </div>
        )}
      </TopBar>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24">
        {editor && !loading && (
          <EditorToolbar editor={editor} disabled={!canEdit} />
        )}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="prose-editor mt-8 rounded-xl border bg-card px-8 py-10 shadow-sm sm:px-12"
        >
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ) : (
            <EditorContent editor={editor} />
          )}
        </motion.div>
      </main>
    </>
  );
}

function SaveIndicator({
  state,
  canEdit,
  loading,
}: {
  state: SaveState;
  canEdit: boolean;
  loading: boolean;
}) {
  if (loading || !canEdit) return null;
  const map = {
    saved: { icon: <Check className="size-3.5" />, text: "Saved" },
    saving: { icon: <Loader2 className="size-3.5 animate-spin" />, text: "Saving…" },
    unsaved: { icon: <Cloud className="size-3.5" />, text: "Editing…" },
    error: { icon: <CloudOff className="size-3.5" />, text: "Save failed" },
  } as const;
  const { icon, text } = map[state];
  return (
    <span
      className={`flex shrink-0 items-center gap-1 text-xs ${
        state === "error" ? "text-destructive" : "text-muted-foreground"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{text}</span>
    </span>
  );
}
