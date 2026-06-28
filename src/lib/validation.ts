import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  name: z.string().trim().min(1).max(80).optional(),
});

export const createDocumentSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
});

// Tiptap content is an arbitrary ProseMirror JSON tree; we only require that the
// root is a "doc" node. Title is optional so autosave can patch either field.
export const updateDocumentSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    content: z
      .object({ type: z.literal("doc") })
      .passthrough()
      .optional(),
  })
  .refine((data) => data.title !== undefined || data.content !== undefined, {
    message: "Provide a title and/or content to update.",
  });

export const shareSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  role: z.enum(["VIEWER", "EDITOR"]).default("VIEWER"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ShareInput = z.infer<typeof shareSchema>;
