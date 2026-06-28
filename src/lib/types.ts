// Shared types for client <-> API payloads.
export type Role = "VIEWER" | "EDITOR";
export type AccessLevel = "owner" | "editor" | "viewer";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

export interface OwnedDocSummary {
  id: string;
  title: string;
  updatedAt: string;
  shareCount: number;
}

export interface SharedDocSummary {
  id: string;
  title: string;
  updatedAt: string;
  role: Role;
  ownerName: string;
  ownerEmail: string;
}

export interface DocumentListResponse {
  owned: OwnedDocSummary[];
  shared: SharedDocSummary[];
}

export interface ShareEntry {
  userId: string;
  name: string;
  email: string;
  role: Role;
}

export interface FullDocument {
  id: string;
  title: string;
  content: unknown; // Tiptap JSON
  updatedAt: string;
  accessLevel: AccessLevel;
  canEdit: boolean;
  owner: { id: string; name: string; email: string };
  shares: ShareEntry[];
}
