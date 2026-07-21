import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";

// Edge middleware: gate protected routes using the edge-safe config (no Prisma
// adapter). The `authorized` callback decides access; unauthorized visitors to
// protected routes are redirected to /signin.
export const { auth: middleware } = NextAuth(authConfig);

export default middleware;

export const config = {
  // Run on everything except Next internals, the auth API, and static files.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
