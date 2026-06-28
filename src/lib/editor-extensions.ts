import { StarterKit } from "@tiptap/starter-kit";
import type { Extensions } from "@tiptap/core";

// Single source of truth for the editor schema. Shared by the client-side
// editor and the server-side HTML->JSON conversion (file import) so that
// imported documents always match what the editor can render.
//
// StarterKit v3 bundles Bold, Italic, Underline, Strike, Headings, Bullet/
// Ordered lists, Blockquote, Code, etc. — covering all formatting we expose.
export const editorExtensions: Extensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
  }),
];
