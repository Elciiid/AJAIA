// Pure authorization logic for documents.
//
// Kept free of any database / framework dependencies so it can be reasoned
// about and unit-tested in isolation. API routes load the relevant rows and
// delegate the actual decision to these functions.

export type Role = "VIEWER" | "EDITOR";

export interface ShareLike {
  userId: string;
  role: Role;
}

export interface DocumentAccessInput {
  ownerId: string;
  shares: ShareLike[];
}

/** The access level a given user has on a document. */
export type AccessLevel = "owner" | "editor" | "viewer" | "none";

export function getAccessLevel(
  doc: DocumentAccessInput,
  userId: string | null | undefined,
): AccessLevel {
  if (!userId) return "none";
  if (doc.ownerId === userId) return "owner";

  const share = doc.shares.find((s) => s.userId === userId);
  if (!share) return "none";
  return share.role === "EDITOR" ? "editor" : "viewer";
}

/** Owner or anyone the document is shared with can view it. */
export function canView(
  doc: DocumentAccessInput,
  userId: string | null | undefined,
): boolean {
  return getAccessLevel(doc, userId) !== "none";
}

/** Only the owner or a user shared with EDITOR rights can modify content. */
export function canEdit(
  doc: DocumentAccessInput,
  userId: string | null | undefined,
): boolean {
  const level = getAccessLevel(doc, userId);
  return level === "owner" || level === "editor";
}

/** Only the owner may rename/delete the document or manage sharing. */
export function canManage(
  doc: DocumentAccessInput,
  userId: string | null | undefined,
): boolean {
  return getAccessLevel(doc, userId) === "owner";
}
