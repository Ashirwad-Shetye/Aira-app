// src/types/next-auth.d.ts
import { Session } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      bio?: string | null;
      status?: string | null;
    } & DefaultSession["user"];
  }

  interface JWT {
    id?: string;
    username?: string | null;
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    bio?: string | null;
    status?: string | null;
  }
}