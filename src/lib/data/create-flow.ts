// src/lib/data/createFlow.ts
"use server";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "../supabase/client";

export async function createFlow({
  title,
  bio,
}: {
  title: string;
  bio?: string;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("flows")
    .insert([
      {
        user_id: session.user.id,
        participants: [session.user.id],
        title,
        bio: bio || "",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("❌ Error creating flow:", error);
    throw new Error("Failed to create flow");
  }

  redirect(`/flows/${data.id}`);
}