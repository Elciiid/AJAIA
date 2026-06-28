"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FileText, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/fetcher";

const DEMO_USERS = [
  { email: "alice@ajaia.test", name: "Alice Owner" },
  { email: "ben@ajaia.test", name: "Ben Editor" },
  { email: "carol@ajaia.test", name: "Carol Viewer" },
];

export function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  async function login(emailToUse: string, nameToUse?: string) {
    setLoading(emailToUse);
    try {
      await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: emailToUse, name: nameToUse }),
      });
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed.");
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <FileText className="size-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Ajaia Docs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, format, and share documents. Sign in with any email — no
            password needed.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email.trim()) login(email.trim(), name.trim() || undefined);
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">
                Display name <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading !== null || !email.trim()}
            >
              {loading === email.trim() ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  Continue <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            or use a demo account
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid gap-2">
            {DEMO_USERS.map((u) => (
              <button
                key={u.email}
                type="button"
                onClick={() => login(u.email, u.name)}
                disabled={loading !== null}
                className="flex items-center justify-between rounded-lg border bg-background px-3 py-2 text-left text-sm transition-colors hover:border-primary/40 hover:bg-accent disabled:opacity-60"
              >
                <span>
                  <span className="font-medium">{u.name}</span>
                  <span className="ml-2 text-muted-foreground">{u.email}</span>
                </span>
                {loading === u.email ? (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                ) : (
                  <ArrowRight className="size-4 text-muted-foreground" />
                )}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Demo accounts are seeded with sample shared documents.
        </p>
      </motion.div>
    </div>
  );
}
