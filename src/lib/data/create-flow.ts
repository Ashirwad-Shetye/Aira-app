// src/lib/data/createFlow.ts
"use server";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "../supabase/client";
import { MemberEntry } from "@/components/member-input/member-input";

export async function createFlow({
  title,
  bio,
  tags,
  members = [],
  inviteEmails = [],
  type = "personal",
}: {
  title: string;
  bio?: string;
  tags?: string[];
  members?: MemberEntry[];
  inviteEmails?: string[];
  type?: "personal" | "shared" | "couple";
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const userEmail = session?.user?.email;

  if (!userId || !userEmail) {
    redirect("/login");
  }

  // ➤ Personal Flow
  if (type === "personal") {
    const { data, error } = await supabase
      .from("flows")
      .insert([
        {
          user_id: userId,
          title,
          bio: bio ?? "",
          tags: tags ?? [],
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("❌ Error creating personal flow:", error);
      throw new Error("Failed to create personal flow");
    }

    return redirect(`/flows/${data.id}`);
  } else {

    // ➤ Shared / Couple Flow
    const { data: flow, error: flowError } = await supabase
      .from("shared_flows")
      .insert([
        {
          user_id: userId,
          title,
          bio: bio ?? "",
          tags: tags ?? [],
        },
      ])
      .select()
      .single();
  
    if (flowError || !flow?.id) {
      console.error("❌ Error creating shared flow:", flowError);
      throw new Error("Failed to create shared flow");
    }
  
    // ➤ Build participant rows
    const participantRows = [
      {
        flow_id: flow.id,
        user_id: userId,
        email: userEmail,
        role: "owner",
      },
      ...members
        .filter((m) => m.id !== userId)
        .map((m) => ({
          flow_id: flow.id,
          user_id: m.id,
          email: m.email,
          role: "pending",
        })),
      ...inviteEmails.map((email) => ({
        flow_id: flow.id,
        email,
        role: "pending",
      })),
    ];
  
    // ➤ Insert participants
    const { error: insertParticipantsError } = await supabase
      .from("shared_flow_participants")
      .insert(participantRows);
  
    if (insertParticipantsError) {
      console.error("⚠️ Failed to insert participants:", insertParticipantsError);
      // Don’t throw — just log it
    }
  
    // ➤ Insert creator into shared_flow_members for unread tracking
    const { error: memberError } = await supabase
      .from("shared_flow_members")
      .insert([
        {
          flow_id: flow.id,
          user_id: userId,
          last_read_at: new Date().toISOString(),
        },
      ]);
  
    if (memberError) {
      console.error("⚠️ Failed to insert shared_flow_member for creator:", memberError);
    }
  
    return redirect(`/flows/${flow.id}?type=shared`);
  }

}