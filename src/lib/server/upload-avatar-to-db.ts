// src/lib/server/upload-avatar-to-db.ts
import { supabaseAdmin } from "@/lib/supabase/client";

export async function uploadAvatarToSupabase(avatarUrl: string, userId: string) {
	if (!avatarUrl || !userId) return null;

	try {
		const response = await fetch(avatarUrl);
		const contentType = response.headers.get("content-type") || "image/jpeg";
		const buffer = await response.arrayBuffer();

		const filePath = `avatars/${userId}.${contentType.split("/")[1]}`;

		const { error } = await supabaseAdmin.storage
			.from("avatars")
			.upload(filePath, buffer, {
				contentType,
				upsert: true,
			});

		if (error) {
			console.error("❌ Error uploading avatar:", error);
			return null;
		}

		const { data } = supabaseAdmin.storage
			.from("avatars")
			.getPublicUrl(filePath);

		return data?.publicUrl ?? null;
	} catch (err) {
		console.error("❌ Avatar upload failed:", err);
		return null;
	}
}