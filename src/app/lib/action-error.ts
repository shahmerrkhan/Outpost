import { ZodError } from "zod";
import * as Sentry from "@sentry/nextjs";

export function toActionError(e: unknown): Error {
  if (e instanceof ZodError) {
    return new Error(e.issues.map((i) => i.message).join(", "));
  }
  if (e instanceof Error) {
    // Don't spam Sentry with expected validation/auth errors — only real unexpected failures
    const expectedMessages = ["Not authorized", "Not signed in", "not found", "Too many requests", "already"];
    if (!expectedMessages.some((m) => e.message.toLowerCase().includes(m.toLowerCase()))) {
      Sentry.captureException(e);
    }
    return e;
  }
  Sentry.captureException(e);
  return new Error("Something went wrong");
}