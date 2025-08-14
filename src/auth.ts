// auth.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { supabase } from "@/lib/supabase/client";
import { uploadAvatarToSupabase } from "@/lib/server/upload-avatar-to-db";
import { generateUniqueUsername } from "@/lib/generate-unique-username";

// Debug client-side execution
if (typeof window !== "undefined") {
  console.error("auth.ts is being executed client-side!");
}

const requiredEnvVars = [
  "AUTH_GOOGLE_ID",
  "AUTH_GOOGLE_SECRET",
  "NEXTAUTH_SECRET",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];

// // Only run env check server-side
// if (typeof window === "undefined") {
//   for (const envVar of requiredEnvVars) {
//     if (!process.env[envVar]) {
//       throw new Error(`Missing environment variable: ${envVar}`);
//     }
//   }
// }

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    CredentialsProvider({
      name: "Email Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const { data, error } = await supabase
          .from("users")
          .select("id, email, password_hash, full_name, avatar_url")
          .eq("email", credentials.email)
          .single();

        if (error || !data?.password_hash) {
          console.error("Credential login error:", error?.message);
          throw new Error("Invalid email or password");
        }

        const isValid = await compare(credentials.password as string, data.password_hash as string);
        if (!isValid) {
          console.error("Invalid password for:", credentials.email);
          throw new Error("Invalid email or password");
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
        session.user.name = token.name || session.user.name;
        session.user.image = token.picture || session.user.image;
        session.user.username = token.username;
        session.user.bio = token.bio;
        session.user.status = token.status;
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

        if (account?.provider === "google") {
          const googleId = user.id;
          const { data: existing, error: lookupError } = await supabase
            .from("users")
            .select("id, google_id")
            .or(`google_id.eq.${googleId},email.eq.${user.email}`)
            .maybeSingle();

          if (lookupError && lookupError.code !== "PGRST116") {
            console.error("Supabase lookup error:", lookupError.message);
            return false;
          }

          if (!existing) {
            const username = await generateUniqueUsername(
              user.name || user.email.split("@")[0]
            );
            const { data: created, error: insertError } = await supabase
              .from("users")
              .insert({
                google_id: googleId,
                email: user.email,
                full_name: user.name,
                avatar_url: user.image,
                username,
                auth_provider: "google",
              })
              .select("id")
              .single();

            if (insertError || !created?.id) {
              console.error("❌ Google insert failed:", insertError);
              return false;
            }
            user.id = created.id;
            if (user.image && user.id) {
              try {
                const uploadedUrl = await uploadAvatarToSupabase(user.image, user.id);
                if (uploadedUrl) {
                  await supabase
                    .from("users")
                    .update({ avatar_url: uploadedUrl })
                    .eq("id", user.id);
                }
              } catch (uploadError) {
                console.error("Failed to upload avatar:", uploadError);
              }
            }
          } else {
            if (!existing.google_id && googleId) {
              const { error: updateError } = await supabase
                .from("users")
                .update({ google_id: googleId, auth_provider: "google" })
                .eq("id", existing.id);
              if (updateError) {
                console.error("❌ Failed to link Google ID:", updateError);
                return false;
              }
            }
            user.id = existing.id;
          }
        }

        if (account?.provider === "credentials") {
          const { data: existing, error } = await supabase
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
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      if (token.sub) {
        const { data: userData, error } = await supabase
          .from("users")
          .select("id, username, full_name, email, avatar_url, bio, status")
          .eq("id", token.sub)
          .single();

        if (error || !userData) {
          console.error("Failed to fetch user data:", error?.message);
          return token;
        }
        token.id = userData.id;
        token.name = userData.full_name;
        token.username = userData.username;
        token.email = userData.email;
        token.picture = userData.avatar_url;
        token.bio = userData.bio;
        token.status = userData.status;
      }
      return token;
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
});