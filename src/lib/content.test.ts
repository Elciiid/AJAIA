import { describe, it, expect } from "vitest";
import { textToDoc, isTiptapDoc, EMPTY_DOC } from "./tiptap";
import { shareSchema, updateDocumentSchema, loginSchema } from "./validation";

describe("textToDoc", () => {
  it("turns each line into a paragraph", () => {
    const doc = textToDoc("hello\nworld");
    expect(doc.type).toBe("doc");
    expect(doc.content).toHaveLength(2);
    expect(doc.content?.[0]).toEqual({
      type: "paragraph",
      content: [{ type: "text", text: "hello" }],
    });
  });

  it("produces a valid empty doc for empty input", () => {
    const doc = textToDoc("");
    expect(isTiptapDoc(doc)).toBe(true);
    expect(doc.content).toHaveLength(1);
  });

  it("EMPTY_DOC is a recognised doc node", () => {
    expect(isTiptapDoc(EMPTY_DOC)).toBe(true);
    expect(isTiptapDoc({ foo: "bar" })).toBe(false);
  });
});

describe("validation schemas", () => {
  it("normalises email to lowercase on login", () => {
    expect(loginSchema.parse({ email: "ME@X.COM" }).email).toBe("me@x.com");
  });

  it("rejects invalid share emails", () => {
    expect(() => shareSchema.parse({ email: "not-an-email" })).toThrow();
  });

  it("defaults share role to VIEWER", () => {
    expect(shareSchema.parse({ email: "a@b.com" }).role).toBe("VIEWER");
  });

  it("requires at least one field on document update", () => {
    expect(() => updateDocumentSchema.parse({})).toThrow();
    expect(updateDocumentSchema.parse({ title: "New title" }).title).toBe(
      "New title",
    );
  });

  it("only accepts content whose root is a doc node", () => {
    expect(() =>
      updateDocumentSchema.parse({ content: { type: "paragraph" } }),
    ).toThrow();
    expect(
      updateDocumentSchema.parse({ content: { type: "doc", content: [] } }),
    ).toBeTruthy();
  });
});
