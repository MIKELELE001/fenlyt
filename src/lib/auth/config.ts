import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Routes that require a signed-in creator. Everything else (landing, /signin,
// auth + static assets) stays public so users can reach the sign-in button.
const PROTECTED_PREFIXES = ["/sources", "/ask", "/receipts", "/demand"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Edge-safe base config shared by the Node runtime (full auth in lib/auth) and
 * the middleware. It must NOT import the Prisma adapter — middleware runs on the
 * edge where the adapter's DB driver is unavailable. Google is edge-safe and
 * reads AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET from the environment automatically.
 */
export const authConfig = {
  providers: [Google],
  pages: { signIn: "/signin" },
  callbacks: {
    // Route gate used by middleware. Returning false on a protected route makes
    // Auth.js redirect the visitor to the sign-in page.
    authorized({ auth, request }) {
      if (!isProtected(request.nextUrl.pathname)) return true;
      return Boolean(auth?.user);
    },
    // Surface the stable user id on the session for ownership queries.
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
} satisfies NextAuthConfig;
