//  app/api/auth/reset-password/confirm/route.ts
import { NextResponse } from "next/server";
import { hash, compare } from "bcryptjs";
import { supabase } from "@/lib/supabase/client";

export async function POST(req: Request) {
  try {
    const { token, email, password } = await req.json();
    if (!token || !email || !password) {
      return NextResponse.json(
        { error: "Token, email, and password are required" },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, reset_token, reset_token_expires_at")
      .eq("email", email)
      .gte("reset_token_expires_at", new Date().toISOString())
      .single();

    if (error || !user || !user.reset_token) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    const isValidToken = await compare(token, user.reset_token);
    if (!isValidToken) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    const passwordHash = await hash(password, 10);
    const { error: updateError } = await supabase
      .from("users")
      .update({
        password_hash: passwordHash,
        reset_token: null,
        reset_token_expires_at: null,
        auth_provider: "credentials",
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update password" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Confirm reset error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}