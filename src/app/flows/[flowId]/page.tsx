import { notFound, redirect } from "next/navigation";
import FlowIdClient from "./flow-id-client";
import { supabase } from "@/lib/supabase/client";

export default async function FlowPage({
	params,
}: {
	params: { flowId: string };
}) {
	const { flowId } = params;

	const { data: flow, error } = await supabase
		.from("flows")
		.select("id, title, bio, created_at, user_id")
		.eq("id", flowId)
		.single();

	if (error || !flow) {
		console.error("❌ Flow not found:", error);
		notFound(); // shows 404 page
	}

	return <FlowIdClient flow={flow} />;
}
