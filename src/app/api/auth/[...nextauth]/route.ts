import { handlers } from "@/lib/auth";

// Mounts the Auth.js request handlers for all /api/auth/* routes (sign-in,
// callback, sign-out, session). See CLAUDE.md addendum — auth added post-spec.
export const { GET, POST } = handlers;
