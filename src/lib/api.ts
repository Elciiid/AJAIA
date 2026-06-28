import { NextResponse } from "next/server";
import { ZodError } from "zod";

/** Consistent JSON error shape across all API routes. */
export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/** Maps thrown errors (including Zod validation errors) to HTTP responses. */
export function handleApiError(err: unknown) {
  if (err instanceof ZodError) {
    const message = err.issues[0]?.message ?? "Invalid request.";
    return jsonError(message, 400);
  }
  console.error("Unhandled API error:", err);
  return jsonError("Something went wrong. Please try again.", 500);
}

export const UNAUTHORIZED = () => jsonError("You must be signed in.", 401);
export const FORBIDDEN = () => jsonError("You do not have access to this document.", 403);
export const NOT_FOUND = () => jsonError("Document not found.", 404);
