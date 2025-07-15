// src/app/flows/[flowId]/page.tsx
import { notFound } from "next/navigation";
import FlowIdClient from "./flow-id-client";
import { supabase } from "@/lib/supabase/client";
import { Suspense } from "react";
import Loading from "./flow-id-loader";

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
		notFound();
	}

	const { data: moments, error: momentsError } = await supabase
		.from("moments")
		.select("id, title, created_at")
		.eq("flow_id", flowId)
		.order("created_at", { ascending: false });

	if (momentsError) {
		console.error("❌ Failed to fetch moments:", momentsError);
	}

	return (
		<Suspense fallback={<Loading />}>
			<FlowIdClient
				flow={flow}
				moments={moments ?? []}
			/>
		</Suspense>
	);
}
