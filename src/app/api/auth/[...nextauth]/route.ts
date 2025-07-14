// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { type AuthOptions, type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import { compare } from "bcryptjs";
import { supabase, supabaseAdmin } from "@/lib/supabase/client";

// Validate environment variables at startup
const requiredEnvVars = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "NEXTAUTH_SECRET",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing environment variable: ${envVar}`);
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Email Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const { data, error } = await supabase
          .from("users")
          .select("id, email, password_hash, full_name, avatar_url")
          .eq("email", credentials.email)
          .single();

        if (error) {
          console.error("Supabase query error in authorize:", error.code, error.message);
          return null;
        }

        if (!data?.password_hash) {
          console.error("No password hash found for user:", credentials.email);
          return null;
        }

        const isValid = await compare(credentials.password, data.password_hash);
        if (!isValid) {
          console.error("Invalid password for user:", credentials.email);
          return null;
        }

        return {
          id: data.id,
          email: data.email,
          name: data.full_name,
          image: data.avatar_url,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url === `${baseUrl}/login` || url === `${baseUrl}/`) {
        return `${baseUrl}/dashboard`;
      }
      return url;
    },
    async signIn({ user, account }) {
      try {
        if (!user?.email) {
          console.error("No email provided for sign-in");
          return false;
        }

        if (account?.provider === "google") {
          const googleId = user.id;

          const { data: existing, error: lookupError } = await supabaseAdmin
            .from("users")
            .select("id, google_id")
            .or(`google_id.eq.${googleId},email.eq.${user.email}`)
            .single();

          if (lookupError && lookupError.code !== "PGRST116") {
            console.error("Supabase lookup error:", lookupError.code, lookupError.message);
            return false;
          }

          if (existing?.id) {
            if (!existing.google_id && googleId) {
              const { error: updateError } = await supabaseAdmin
                .from("users")
                .update({ google_id: googleId })
                .eq("id", existing.id);

              if (updateError) {
                console.error("Failed to link Google ID:", updateError.code, updateError.message);
                return false;
              }
            }
            user.id = existing.id;
          } else {
            const { data: created, error: insertError } = await supabaseAdmin
              .from("users")
              .insert({
                google_id: googleId,
                email: user.email,
                full_name: user.name,
                avatar_url: user.image,
              })
              .select("id")
              .single();

            if (insertError || !created?.id) {
              console.error("Failed to insert Google user:", insertError?.code, insertError?.message);
              return false;
            }
            user.id = created.id;
          }
        }

        if (account?.provider === "credentials") {
          const { data: existing, error } = await supabaseAdmin
            .from("users")
            .select("id")
            .eq("email", user.email)
            .single();

          if (error || !existing?.id) {
            console.error("User not found for credentials login:", error?.code, error?.message);
            return false;
          }
          user.id = existing.id;
        }

        return true;
      } catch (err) {
        console.error("signIn error:", err instanceof Error ? err.message : "Unknown error");
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
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export const GET = async (req: Request, ctx: any) => {
  return await handler(req, ctx);
};

export const POST = async (req: Request, ctx: any) => {
  return await handler(req, ctx);
};