"use client";

import { useState } from "react";
import { UserPlus, Trash2, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api } from "@/lib/fetcher";
import type { Role, ShareEntry } from "@/lib/types";

function initials(value: string) {
  return value.slice(0, 2).toUpperCase();
}

export function ShareDialog({
  documentId,
  ownerEmail,
  initialShares,
}: {
  documentId: string;
  ownerEmail: string;
  initialShares: ShareEntry[];
}) {
  const [open, setOpen] = useState(false);
  const [shares, setShares] = useState<ShareEntry[]>(initialShares);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("VIEWER");
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  async function addShare(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setAdding(true);
    try {
      const { share } = await api<{ share: ShareEntry }>(
        `/api/documents/${documentId}/shares`,
        { method: "POST", body: JSON.stringify({ email: email.trim(), role }) },
      );
      setShares((prev) => [
        ...prev.filter((s) => s.userId !== share.userId),
        share,
      ]);
      setEmail("");
      toast.success(`Shared with ${share.email}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not share.");
    } finally {
      setAdding(false);
    }
  }

  async function changeRole(userId: string, nextRole: Role) {
    const entry = shares.find((s) => s.userId === userId);
    if (!entry) return;
    setShares((prev) =>
      prev.map((s) => (s.userId === userId ? { ...s, role: nextRole } : s)),
    );
    try {
      await api(`/api/documents/${documentId}/shares`, {
        method: "POST",
        body: JSON.stringify({ email: entry.email, role: nextRole }),
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update role.");
    }
  }

  async function removeShare(userId: string) {
    setRemoving(userId);
    try {
      await api(`/api/documents/${documentId}/shares?userId=${userId}`, {
        method: "DELETE",
      });
      setShares((prev) => prev.filter((s) => s.userId !== userId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove access.");
    } finally {
      setRemoving(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="size-4" /> Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share document</DialogTitle>
          <DialogDescription>
            Add people by email. They can sign in with that email to access it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={addShare} className="flex items-center gap-2">
          <Input
            type="email"
            placeholder="person@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
          <Select value={role} onValueChange={(v) => setRole(v as Role)}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VIEWER">Viewer</SelectItem>
              <SelectItem value="EDITOR">Editor</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" size="icon" disabled={adding}>
            {adding ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
          </Button>
        </form>

        <div className="space-y-1">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary/10 text-xs text-primary">
                {initials(ownerEmail)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{ownerEmail}</div>
              <div className="text-xs text-muted-foreground">You</div>
            </div>
            <span className="text-xs text-muted-foreground">Owner</span>
          </div>

          {shares.length === 0 ? (
            <p className="px-2 py-3 text-center text-xs text-muted-foreground">
              Not shared with anyone yet.
            </p>
          ) : (
            shares.map((s) => (
              <div
                key={s.userId}
                className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent/50"
              >
                <Avatar className="size-8">
                  <AvatarFallback className="bg-accent text-xs text-accent-foreground">
                    {initials(s.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{s.email}</div>
                </div>
                <Select
                  value={s.role}
                  onValueChange={(v) => changeRole(s.userId, v as Role)}
                >
                  <SelectTrigger size="sm" className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIEWER">Viewer</SelectItem>
                    <SelectItem value="EDITOR">Editor</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeShare(s.userId)}
                  disabled={removing === s.userId}
                  aria-label={`Remove ${s.email}`}
                >
                  {removing === s.userId ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
