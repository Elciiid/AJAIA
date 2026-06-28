"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FilePlus2,
  Upload,
  Loader2,
  FileText,
  Users,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TopBar } from "@/components/top-bar";
import { DocumentCard } from "@/components/document-card";
import { api } from "@/lib/fetcher";
import type {
  DocumentListResponse,
  OwnedDocSummary,
  SessionUser,
  SharedDocSummary,
} from "@/lib/types";

const ACCEPT = ".txt,.md,.markdown,.docx";

export function Dashboard({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [owned, setOwned] = useState<OwnedDocSummary[]>([]);
  const [shared, setShared] = useState<SharedDocSummary[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await api<DocumentListResponse>("/api/documents");
      setOwned(data.owned);
      setShared(data.shared);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load documents.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function createDoc() {
    setCreating(true);
    try {
      const { id } = await api<{ id: string }>("/api/documents", {
        method: "POST",
        body: JSON.stringify({}),
      });
      router.push(`/doc/${id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create document.");
      setCreating(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        const form = new FormData();
        form.append("file", file);
        const { id } = await api<{ id: string }>("/api/upload", {
          method: "POST",
          body: form,
        });
        toast.success(`Imported "${file.name}"`);
        router.push(`/doc/${id}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed.");
        setUploading(false);
      }
    }
    e.target.value = "";
  }

  return (
    <>
      <TopBar user={user} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Your documents</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {user.name.split(" ")[0]}.
            </p>
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInput}
              type="file"
              accept={ACCEPT}
              hidden
              onChange={handleUpload}
            />
            <Button
              variant="outline"
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              Import file
            </Button>
            <Button onClick={createDoc} disabled={creating}>
              {creating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FilePlus2 className="size-4" />
              )}
              New document
            </Button>
          </div>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Import supports .txt, .md, and .docx files (max 5 MB).
        </p>

        <Section
          title="Owned by you"
          icon={<FileText className="size-4" />}
          loading={loadingList}
          empty={owned.length === 0}
          emptyText="No documents yet. Create one or import a file to get started."
        >
          {owned.map((doc, i) => (
            <DocumentCard
              key={doc.id}
              index={i}
              doc={{
                id: doc.id,
                title: doc.title,
                updatedAt: doc.updatedAt,
                variant: "owned",
                shareCount: doc.shareCount,
              }}
              onChanged={refresh}
            />
          ))}
        </Section>

        <Section
          title="Shared with you"
          icon={<Users className="size-4" />}
          loading={loadingList}
          empty={shared.length === 0}
          emptyText="Documents others share with you will appear here."
        >
          {shared.map((doc, i) => (
            <DocumentCard
              key={doc.id}
              index={i}
              doc={{
                id: doc.id,
                title: doc.title,
                updatedAt: doc.updatedAt,
                variant: "shared",
                role: doc.role,
                ownerName: doc.ownerName,
              }}
              onChanged={refresh}
            />
          ))}
        </Section>
      </main>
    </>
  );
}

function Section({
  title,
  icon,
  loading,
  empty,
  emptyText,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  loading: boolean;
  empty: boolean;
  emptyText: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {icon} {title}
      </h2>
      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : empty ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground"
        >
          <Inbox className="mb-2 size-6 opacity-50" />
          {emptyText}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {children}
        </div>
      )}
    </section>
  );
}
