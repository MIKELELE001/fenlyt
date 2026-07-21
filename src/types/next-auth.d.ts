import type { DefaultSession } from "next-auth";

// Augment the session so the creator's stable id is available to ownership
// queries (attached in the session callback from the JWT `sub`).
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
