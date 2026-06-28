import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { updateDocumentSchema } from "@/lib/validation";
import {
  handleApiError,
  UNAUTHORIZED,
  FORBIDDEN,
  NOT_FOUND,
} from "@/lib/api";
import { canEdit, canManage, getAccessLevel } from "@/lib/access";

async function loadDocument(id: string) {
  return prisma.document.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      shares: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });
}

// GET /api/documents/[id] -> full document (view access required).
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) return UNAUTHORIZED();

    const { id } = await params;
    const doc = await loadDocument(id);
    if (!doc) return NOT_FOUND();

    const level = getAccessLevel(doc, user.id);
    if (level === "none") return FORBIDDEN();

    return NextResponse.json({
      id: doc.id,
      title: doc.title,
      content: doc.content,
      updatedAt: doc.updatedAt,
      accessLevel: level,
      canEdit: level === "owner" || level === "editor",
      owner: { id: doc.owner.id, name: doc.owner.name, email: doc.owner.email },
      // Only the owner needs the full collaborator list.
      shares:
        level === "owner"
          ? doc.shares.map((s) => ({
              userId: s.user.id,
              name: s.user.name,
              email: s.user.email,
              role: s.role,
            }))
          : [],
    });
  } catch (err) {
    return handleApiError(err);
  }
}

// PATCH /api/documents/[id] -> update title and/or content (edit access required).
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) return UNAUTHORIZED();

    const { id } = await params;
    const doc = await loadDocument(id);
    if (!doc) return NOT_FOUND();
    if (!canEdit(doc, user.id)) return FORBIDDEN();

    const body = await req.json();
    const data = updateDocumentSchema.parse(body);

    const updated = await prisma.document.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.content !== undefined
          ? { content: data.content as Prisma.InputJsonValue }
          : {}),
      },
      select: { id: true, title: true, updatedAt: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    return handleApiError(err);
  }
}

// DELETE /api/documents/[id] -> owner only.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) return UNAUTHORIZED();

    const { id } = await params;
    const doc = await loadDocument(id);
    if (!doc) return NOT_FOUND();
    if (!canManage(doc, user.id)) return FORBIDDEN();

    await prisma.document.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
