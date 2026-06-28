import { generateJSON } from "@tiptap/html/server";
import { editorExtensions } from "./editor-extensions";

// A valid, empty ProseMirror/Tiptap document.
export const EMPTY_DOC = {
  type: "doc",
  content: [{ type: "paragraph" }],
} as const;

export type TiptapDoc = { type: "doc"; content?: unknown[] };

/** Minimal structural check that a value is a Tiptap/ProseMirror doc node. */
export function isTiptapDoc(value: unknown): value is TiptapDoc {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { type?: unknown }).type === "doc"
  );
}

/** Convert an HTML string (from Markdown/DOCX import) into a Tiptap doc. */
export function htmlToDoc(html: string): TiptapDoc {
  return generateJSON(html, editorExtensions) as TiptapDoc;
}

/** Convert plain text into a Tiptap doc, one paragraph per line. */
export function textToDoc(text: string): TiptapDoc {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const content = lines.map((line) =>
    line.length > 0
      ? { type: "paragraph", content: [{ type: "text", text: line }] }
      : { type: "paragraph" },
  );
  return { type: "doc", content: content.length > 0 ? content : [{ type: "paragraph" }] };
}
