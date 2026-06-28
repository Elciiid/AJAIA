import { describe, it, expect } from "vitest";
import {
  getAccessLevel,
  canView,
  canEdit,
  canManage,
  type DocumentAccessInput,
} from "./access";

// Document owned by "owner", shared with "editor" (EDITOR) and "viewer" (VIEWER).
const doc: DocumentAccessInput = {
  ownerId: "owner",
  shares: [
    { userId: "editor", role: "EDITOR" },
    { userId: "viewer", role: "VIEWER" },
  ],
};

describe("getAccessLevel", () => {
  it("identifies the owner", () => {
    expect(getAccessLevel(doc, "owner")).toBe("owner");
  });
  it("identifies an editor collaborator", () => {
    expect(getAccessLevel(doc, "editor")).toBe("editor");
  });
  it("identifies a viewer collaborator", () => {
    expect(getAccessLevel(doc, "viewer")).toBe("viewer");
  });
  it("returns 'none' for a stranger", () => {
    expect(getAccessLevel(doc, "stranger")).toBe("none");
  });
  it("returns 'none' for an unauthenticated user", () => {
    expect(getAccessLevel(doc, null)).toBe("none");
    expect(getAccessLevel(doc, undefined)).toBe("none");
  });
});

describe("canView", () => {
  it("allows owner, editor and viewer", () => {
    expect(canView(doc, "owner")).toBe(true);
    expect(canView(doc, "editor")).toBe(true);
    expect(canView(doc, "viewer")).toBe(true);
  });
  it("blocks strangers and anonymous users", () => {
    expect(canView(doc, "stranger")).toBe(false);
    expect(canView(doc, null)).toBe(false);
  });
});

describe("canEdit", () => {
  it("allows owner and editor", () => {
    expect(canEdit(doc, "owner")).toBe(true);
    expect(canEdit(doc, "editor")).toBe(true);
  });
  it("blocks viewers, strangers and anonymous users", () => {
    expect(canEdit(doc, "viewer")).toBe(false);
    expect(canEdit(doc, "stranger")).toBe(false);
    expect(canEdit(doc, null)).toBe(false);
  });
});

describe("canManage", () => {
  it("allows only the owner", () => {
    expect(canManage(doc, "owner")).toBe(true);
    expect(canManage(doc, "editor")).toBe(false);
    expect(canManage(doc, "viewer")).toBe(false);
    expect(canManage(doc, "stranger")).toBe(false);
  });
});
