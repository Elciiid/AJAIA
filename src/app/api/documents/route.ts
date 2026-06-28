import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { createDocumentSchema } from "@/lib/validation";
import { handleApiError, UNAUTHORIZED } from "@/lib/api";
import { EMPTY_DOC } from "@/lib/tiptap";

// GET /api/documents -> documents owned by, and shared with, the current user.
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return UNAUTHORIZED();

    const [owned, sharedRows] = await Promise.all([
      prisma.document.findMany({
        where: { ownerId: user.id },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          updatedAt: true,
          _count: { select: { shares: true } },
        },
      }),
      prisma.share.findMany({
        where: { userId: user.id },
        orderBy: { document: { updatedAt: "desc" } },
        select: {
          role: true,
          document: {
            select: {
              id: true,
              title: true,
              updatedAt: true,
              owner: { select: { name: true, email: true } },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      owned: owned.map((d) => ({
        id: d.id,
        title: d.title,
        updatedAt: d.updatedAt,
        shareCount: d._count.shares,
      })),
      shared: sharedRows.map((s) => ({
        id: s.document.id,
        title: s.document.title,
        updatedAt: s.document.updatedAt,
        role: s.role,
        ownerName: s.document.owner.name,
        ownerEmail: s.document.owner.email,
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}

// POST /api/documents -> create a new blank document owned by the current user.
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return UNAUTHORIZED();

    const body = await req.json().catch(() => ({}));
    const { title } = createDocumentSchema.parse(body ?? {});

    const doc = await prisma.document.create({
      data: {
        title: title || "Untitled document",
        content: EMPTY_DOC,
        ownerId: user.id,
      },
      select: { id: true },
    });

    return NextResponse.json({ id: doc.id }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
