import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";
import { authConfig } from "./config";

/**
 * Full Auth.js setup for the Node runtime: the edge-safe base config plus the
 * Prisma adapter (persists users + Google accounts) and JWT sessions. JWT
 * strategy lets middleware verify sessions at the edge without a DB round-trip,
 * while the adapter still records the creator's account server-side.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
});
