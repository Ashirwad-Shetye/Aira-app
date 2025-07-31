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
  const userEmail = session?.user.email

  if (!userId || !userEmail) {
    redirect("/login");
  }

  if (type === "personal") {
    const { data, error } = await supabase
      .from("flows")
      .insert([
        {
          user_id: userId,
          title,
          bio: bio ?? "",
          tags: tags ?? [],
          participants: [userId],
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("❌ Error creating personal flow:", error);
      throw new Error("Failed to create personal flow");
    }

    redirect(`/flows/${data.id}`);
  } else {
    const { data: flow, error: flowError } = await supabase
      .from("shared_flows")
      .insert([
        {
          user_id: userId,
          title: title,
          bio: bio ?? "",
          tags: tags ?? [],
        },
      ])
      .select()
      .single();
    console.log("Inserted shared flow:", { flow, flowError });
    if (flowError || !flow?.id) {
      console.error("❌ Error creating shared flow:", flowError);
      throw new Error("Failed to create shared flow");
    }

    const participantIds = members.filter((user) => user.id !== userId);

    const participantRows = [
      { flow_id: flow.id, user_id: userId, role: "owner" },
      ...participantIds.map((uid) => ({
        flow_id: flow.id,
        user_id: uid.id,
        email: uid.email,
        role: "pending",
      })),
    ];

    const { error: insertError } = await supabase
      .from("shared_flow_participants")
      .insert(participantRows);

    if (insertError) {
      console.error("⚠️ Failed to insert participants:", insertError);
    }

    const emailParticipantRows = inviteEmails.map((email) => ({
      flow_id: flow.id,
      email,
      role: "pending",
    }));

    const { error: insertEmailError } = await supabase
      .from("shared_flow_participants")
      .insert(emailParticipantRows);

    if (insertEmailError) {
      console.error("⚠️ Failed to insert email-based participants:", insertEmailError);
    }

    await supabase.from("shared_flow_members").insert({
      flow_id: flow.id,
      user_id: userId,
      last_read_at: new Date().toISOString(),
    });

    redirect(`/flows/${flow.id}?type=shared`);
  }
}