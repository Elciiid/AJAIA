import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { marked } from "marked";
import mammoth from "mammoth";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { handleApiError, jsonError, UNAUTHORIZED } from "@/lib/api";
import { htmlToDoc, textToDoc, type TiptapDoc } from "@/lib/tiptap";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const SUPPORTED = [".txt", ".md", ".markdown", ".docx"];

// POST /api/upload -> import a .txt/.md/.docx file as a new editable document.
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return UNAUTHORIZED();

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return jsonError("No file provided.", 400);
    }
    if (file.size === 0) {
      return jsonError("The file is empty.", 400);
    }
    if (file.size > MAX_BYTES) {
      return jsonError("File is too large (max 5 MB).", 400);
    }

    const name = file.name;
    const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
    if (!SUPPORTED.includes(ext)) {
      return jsonError(
        `Unsupported file type "${ext}". Supported: .txt, .md, .docx`,
        400,
      );
    }

    let content: TiptapDoc;
    if (ext === ".docx") {
      const buffer = Buffer.from(await file.arrayBuffer());
      const { value: html } = await mammoth.convertToHtml({ buffer });
      content = htmlToDoc(html);
    } else if (ext === ".md" || ext === ".markdown") {
      const text = await file.text();
      const html = await marked.parse(text);
      content = htmlToDoc(html);
    } else {
      // .txt
      const text = await file.text();
      content = textToDoc(text);
    }

    const title = name.replace(/\.[^.]+$/, "") || "Imported document";

    const doc = await prisma.document.create({
      data: {
        title,
        content: content as unknown as Prisma.InputJsonValue,
        ownerId: user.id,
      },
      select: { id: true },
    });

    return NextResponse.json({ id: doc.id }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
