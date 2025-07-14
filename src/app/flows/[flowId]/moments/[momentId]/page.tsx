// Server Component
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import MomentEditorClient from "./moment-id-client";

export default async function MomentEditorPage({
	params,
}: {
	params: { flowId: string; momentId: string };
}) {
	const { flowId, momentId } = params;

	const { data: flow, error: flowError } = await supabase
		.from("flows")
		.select("id, title")
		.eq("id", flowId)
		.single();

	const { data: moment, error: momentError } = await supabase
		.from("moments")
		.select("id, title, content")
		.eq("id", momentId)
		.single();

	if (flowError || momentError || !flow || !moment) {
		console.error("❌ Could not load flow or moment:", {
			flowError,
			momentError,
		});
		notFound();
	}

	return (
		<MomentEditorClient
			flow={flow}
			moment={moment}
		/>
	);
}
