// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { type AuthOptions, type DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { supabase, supabaseAdmin } from "@/lib/supabase/client";
import { uploadAvatarToSupabase } from "@/lib/server/upload-avatar-to-db";
import { generateUniqueUsername } from "@/lib/generate-unique-username";

const requiredEnvVars = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "NEXTAUTH_SECRET",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_KEY",
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
    GoogleProvider({
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

        if (error || !data?.password_hash) {
          console.error("Credential login error:", error?.message);
          return null;
        }

        const isValid = await compare(credentials.password, data.password_hash);
        if (!isValid) {
          console.error("Invalid password for:", credentials.email);
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
    error: "/auth-error",
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
          console.error("❌ No email provided during sign-in");
          return false;
        }

        // --- GOOGLE LOGIN FLOW ---
        if (account?.provider === "google") {
          const googleId = user.id;

          const { data: existing, error: lookupError } = await supabaseAdmin
          .from("users")
          .select("id, google_id")
          .or(`google_id.eq.${googleId},email.eq.${user.email}`)
          .maybeSingle();

          if (lookupError && lookupError.code !== "PGRST116") {
            console.error("Supabase lookup error:", lookupError.message);
          }

          if ( !existing ) {
            const username = await generateUniqueUsername(user.name || user.email.split("@")[0]);
            const { data: created, error: insertError } = await supabaseAdmin
              .from("users")
              .insert({
                google_id: googleId,
                email: user.email,
                full_name: user.name,
                avatar_url: user.image,
                username: username
              })
              .select("id")
              .single();

            if (insertError || !created?.id) {
              console.error("❌ Google insert failed:", insertError);
              return false;
            }
            user.id = created.id;
          } else {
            if (!existing.google_id && googleId) {
              const { error: updateError } = await supabaseAdmin
                .from("users")
                .update({ google_id: googleId })
                .eq("id", existing.id);

              if (updateError) {
                console.error("❌ Failed to link Google ID:", updateError);
                return false;
              }
            }
            user.id = existing.id;
          }
          
          const uploadedUrl = await uploadAvatarToSupabase(user.image!, user.id);

          await supabaseAdmin
            .from("users")
            .update({
              avatar_url: uploadedUrl,
            })
            .eq("id", user.id);
        }

        // --- CREDENTIALS LOGIN FLOW ---
        if (account?.provider === "credentials") {
          const { data: existing, error } = await supabaseAdmin
            .from("users")
            .select("id")
            .eq("email", user.email)
            .single();

          if (error || !existing?.id) {
            console.error("❌ Credentials lookup failed:", error);
            return false;
          }
          user.id = existing.id;
        }

        return true;
      } catch (err) {
        console.error("❌ signIn() exception:", err);
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

export const GET = handler;
export const POST = handler;