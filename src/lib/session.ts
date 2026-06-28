import { getIronSession, type IronSession } from "iron-session";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export interface SessionData {
  userId?: string;
}

// Resolved lazily (at request time, not module load) so a missing env var can
// never crash `next build` while it collects page data. An insecure/short
// secret would silently weaken cookie encryption, so we still fail fast — just
// at the point a session is actually used.
function getSessionOptions() {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret || sessionSecret.length < 32) {
    throw new Error(
      "SESSION_SECRET env var is required and must be at least 32 characters.",
    );
  }
  return {
    password: sessionSecret,
    cookieName: "ajaia_docs_session",
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    },
  };
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, getSessionOptions());
}

/**
 * Returns the currently authenticated user, or null if there is no valid
 * session. Looks the user up fresh so deleted users don't keep access.
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true },
  });
  return user;
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
