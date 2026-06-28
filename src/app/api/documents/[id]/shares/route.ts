import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { shareSchema } from "@/lib/validation";
import {
  handleApiError,
  jsonError,
  UNAUTHORIZED,
  FORBIDDEN,
  NOT_FOUND,
} from "@/lib/api";

// Only the owner may view or change the collaborator list.
async function requireOwner(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: UNAUTHORIZED() };

  const doc = await prisma.document.findUnique({
    where: { id },
    select: { id: true, ownerId: true },
  });
  if (!doc) return { error: NOT_FOUND() };
  if (doc.ownerId !== user.id) return { error: FORBIDDEN() };

  return { user, doc };
}

function serializeShares(
  shares: { role: string; user: { id: string; name: string; email: string } }[],
) {
  return shares.map((s) => ({
    userId: s.user.id,
    name: s.user.name,
    email: s.user.email,
    role: s.role,
  }));
}

// GET -> list collaborators.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await requireOwner(id);
    if ("error" in result) return result.error;

    const shares = await prisma.share.findMany({
      where: { documentId: id },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json({ shares: serializeShares(shares) });
  } catch (err) {
    return handleApiError(err);
  }
}

// POST -> grant a user access by email (creating the account if needed).
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await requireOwner(id);
    if ("error" in result) return result.error;

    const body = await req.json();
    const { email, role } = shareSchema.parse(body);

    if (email === result.user.email) {
      return jsonError("You already own this document.", 400);
    }

    // Upsert the target user so you can share with people who haven't logged in yet.
    const target = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name: email.split("@")[0] },
      select: { id: true, name: true, email: true },
    });

    const share = await prisma.share.upsert({
      where: { documentId_userId: { documentId: id, userId: target.id } },
      update: { role },
      create: { documentId: id, userId: target.id, role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ share: serializeShares([share])[0] }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

// DELETE -> revoke a user's access. Target user id passed as ?userId=.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await requireOwner(id);
    if ("error" in result) return result.error;

    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return jsonError("Missing userId.", 400);

    await prisma.share.deleteMany({ where: { documentId: id, userId } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
