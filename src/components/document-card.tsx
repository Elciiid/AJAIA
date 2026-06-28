"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MoreVertical,
  Pencil,
  Trash2,
  FileText,
  Users,
  Eye,
  SquarePen,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/fetcher";
import type { Role } from "@/lib/types";

type CardDoc =
  | {
      id: string;
      title: string;
      updatedAt: string;
      variant: "owned";
      shareCount: number;
    }
  | {
      id: string;
      title: string;
      updatedAt: string;
      variant: "shared";
      role: Role;
      ownerName: string;
    };

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function DocumentCard({
  doc,
  index,
  onChanged,
}: {
  doc: CardDoc;
  index: number;
  onChanged: () => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(doc.title);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const isOwner = doc.variant === "owned";

  async function saveRename() {
    const next = title.trim();
    if (!next || next === doc.title) {
      setRenaming(false);
      setTitle(doc.title);
      return;
    }
    setBusy(true);
    try {
      await api(`/api/documents/${doc.id}`, {
        method: "PATCH",
        body: JSON.stringify({ title: next }),
      });
      setRenaming(false);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Rename failed.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await api(`/api/documents/${doc.id}`, { method: "DELETE" });
      toast.success("Document deleted.");
      setConfirmDelete(false);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.2) }}
      className="group relative flex flex-col rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between">
        <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <FileText className="size-4" />
        </span>
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="rounded-md p-1 text-muted-foreground opacity-0 outline-none transition-opacity hover:bg-accent group-hover:opacity-100 focus-visible:opacity-100"
                aria-label="Document actions"
              >
                <MoreVertical className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setRenaming(true);
                }}
              >
                <Pencil className="size-4" /> Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => {
                  e.preventDefault();
                  setConfirmDelete(true);
                }}
              >
                <Trash2 className="size-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {renaming ? (
        <Input
          autoFocus
          value={title}
          disabled={busy}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={saveRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") saveRename();
            if (e.key === "Escape") {
              setRenaming(false);
              setTitle(doc.title);
            }
          }}
          className="mb-1 h-8"
        />
      ) : (
        <Link href={`/doc/${doc.id}`} className="outline-none">
          <h3 className="line-clamp-2 font-medium leading-snug hover:underline">
            {doc.title}
          </h3>
        </Link>
      )}

      <div className="mt-auto flex items-center justify-between pt-3">
        <span className="text-xs text-muted-foreground">
          {doc.variant === "shared"
            ? `${doc.ownerName} · ${timeAgo(doc.updatedAt)}`
            : `Edited ${timeAgo(doc.updatedAt)}`}
        </span>
        {doc.variant === "owned" ? (
          doc.shareCount > 0 ? (
            <Badge variant="secondary" className="gap-1">
              <Users className="size-3" /> {doc.shareCount}
            </Badge>
          ) : null
        ) : (
          <Badge variant="secondary" className="gap-1">
            {doc.role === "EDITOR" ? (
              <>
                <SquarePen className="size-3" /> Editor
              </>
            ) : (
              <>
                <Eye className="size-3" /> Viewer
              </>
            )}
          </Badge>
        )}
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete document?</DialogTitle>
            <DialogDescription>
              &ldquo;{doc.title}&rdquo; will be permanently deleted for everyone it
              is shared with. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={remove} disabled={busy}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
