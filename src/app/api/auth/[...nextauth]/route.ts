// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { type AuthOptions, type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Extend the default Session type to include custom properties
declare module "next-auth" {
  interface Session {
    user: {
      id?: string; // Add custom `id` property to user
    } & DefaultSession["user"];
  }
}

// Extend the JWT type to include custom properties
declare module "next-auth/jwt" {
  interface JWT {
    sub?: string; // Ensure `sub` is available in the token
  }
}

export const authOptions: AuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }: { session: DefaultSession; token: JWT }) {
      console.log("🧠 Session callback:", { session, token });
      if (token.sub && session.user) {
        (session.user as typeof session.user & { id?: string }).id = token.sub; // Assign token.sub to session.user.id
      }
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      if (url.includes("/login")) {
        return `${baseUrl}/dashboard`;
      }
      return url;
    },
    async signIn({ user }) {
    try {
      if (!user?.id || !user?.email) return false;

      await supabaseAdmin
        .from("users")
        .upsert({
          id: user.id,  // token.sub → stored as session.user.id
          email: user.email,
          full_name: user.name,
          avatar_url: user.image,
        }, { onConflict: 'id' });

      return true;
    } catch (err) {
      console.error("❌ Failed to upsert user into Supabase:", err);
      return false;
    }
  },
  },
  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };