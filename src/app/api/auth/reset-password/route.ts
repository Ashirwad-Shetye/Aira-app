//  app/api/auth/reset-password/route.ts

import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { hash } from "bcryptjs";
import nodemailer from "nodemailer";
import { supabase } from "@/lib/supabase/client";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = await hash(token, 10);
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour expiry

    const { error: updateError } = await supabase
      .from("users")
      .update({
        reset_token: tokenHash,
        reset_token_expires_at: expiresAt.toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json(
        { error: "Failed to generate reset token" },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${token}?email=${encodeURIComponent(email)}`;
    await transporter.sendMail({
      from: '"Aira" <no-reply@yourapp.com>',
      to: email,
      subject: "Reset Your Aira Password",
      html: `
        <p>Hi,</p>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>If you didn’t request this, ignore this email.</p>
        <p>— The Aira Team</p>
      `,
    });

    return NextResponse.json({ message: "Reset link sent" }, { status: 200 });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
