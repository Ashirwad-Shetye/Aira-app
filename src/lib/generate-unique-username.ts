import { supabaseAdmin } from "@/lib/supabase/client";

export const generateUniqueUsername = async (base: string) => {
	const baseUsername = base
		.trim()
		.toLowerCase()
		.replace(/\s+/g, "_")
		.replace(/[^a-z0-9_]/g, "");

	let username = baseUsername;
	let suffix = 1;

	while (true) {
		const { data, error } = await supabaseAdmin
			.from("users")
			.select("id")
			.eq("username", username)
			.single();

		if (error?.code === "PGRST116") break;
		if (error) throw error;

		username = `${baseUsername}${suffix++}`;
	}

	return username;
};