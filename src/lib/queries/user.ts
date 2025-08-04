import { supabase } from "@/lib/supabase/client";

export async function getUserById(user_id: string) {
	const { data, error } = await supabase
		.from("users")
		.select("username, email, avatar_url, bio")
		.eq("id", user_id)
		.maybeSingle();

	if (error) throw error;
	return data;
}