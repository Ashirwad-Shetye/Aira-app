"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase/client";
import { Flow } from "@/types/flows";
import { Moment } from "@/types/moments";
import { Button } from "@/components/ui/button";
import Icons from "@/components/ui/icons";
import { formatDate } from "@/lib/date-convertors";
import dynamic from "next/dynamic";

const LeftNavbar = dynamic(
	() => import("@/components/left-navbar/left-navbar"),
	{
		ssr: false,
	}
);
const BottomControls = dynamic(
	() => import("@/components/bottom-controls/bottom-controls"),
	{
		ssr: false,
	}
);

export default function FlowIdPage() {
	const { flowId } = useParams();
	const router = useRouter();
	const { data: session, status } = useSession();

	const [flow, setFlow] = useState<Flow | null>(null);
	const [moments, setMoments] = useState<Moment[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!flowId || typeof flowId !== "string") return;
		if (status !== "authenticated" || !session?.user?.id) return;

		const fetchData = async () => {
			setLoading(true);
			setError(null);

			try {
				const { data: flowData, error: flowError } = await supabase
					.from("flows")
					.select("id, title, bio, created_at, user_id")
					.eq("id", flowId)
					.single();

				if (flowError || !flowData)
					throw flowError || new Error("Flow not found");

				const { data: momentData, error: momentError } = await supabase
					.from("moments")
					.select("id, title, created_at")
					.eq("flow_id", flowId)
					.order("created_at", { ascending: false });

				if (momentError) throw momentError;

				setFlow(flowData);
				setMoments(momentData ?? []);
			} catch (err: any) {
				console.error("❌ Error loading flow/moments:", err.message);
				setError("Failed to load flow. Please try again.");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [flowId, status, session?.user?.id]);

	if (loading) {
		return (
			<div className='p-5 flex flex-col relative w-full flex-1'>
				<div className='flex gap-5 flex-1'>
					<LeftNavbar />
					<div className='flex flex-col w-full gap-5'>
						<div className='flex items-center gap-5'>
							<div className='h-10 w-20 bg-gray-100 animate-pulse rounded' />
							<div className='h-8 w-40 bg-gray-100 animate-pulse rounded' />
						</div>
						<div className='h-10 w-80 bg-gray-100 animate-pulse rounded' />
						<div className='grid grid-cols-3 gap-4 mt-5'>
							{Array.from({ length: 3 }).map((_, i) => (
								<div
									key={i}
									className='h-32 bg-gray-100 animate-pulse rounded-xl'
								/>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error || !flow) {
		return (
			<div className='p-5 flex flex-col items-center justify-center text-red-500 text-center'>
				<p>{error || "Flow not found."}</p>
			</div>
		);
	}

	return (
		<div className='p-5 flex flex-col overflow-hidden relative w-full flex-1'>
			<div className='flex gap-5 flex-1 relative'>
				<LeftNavbar />
				<div className='flex flex-col overflow-hidden relative w-full'>
					<div className='flex-1 flex flex-col gap-5 relative'>
						<div className='flex items-center gap-5'>
							<Button
								variant='secondary'
								onClick={() => router.back()}
								className='flex items-center gap-1 text-gray-500'
							>
								<Icons.arrowLeft />
								<p>Back</p>
							</Button>
							<h1 className='font-pt-sans text-2xl'>
								{flow.title || "Untitled Flow"}
							</h1>
						</div>

						<div>
							<div className='flex items-center bg-white rounded-full gap-2 border w-[40%] min-w-80 px-3 py-1.5'>
								<Icons.search />
								<input
									type='text'
									placeholder='Search your moments'
									className='text-gray-800 w-full font-cabin focus:ring-0 outline-none'
								/>
							</div>
						</div>

						<div className='grid grid-cols-3 gap-4'>
							{moments.length === 0 ? (
								<p className='text-muted-foreground'>
									No moments yet. Add your first one.
								</p>
							) : (
								moments.map((moment) => (
									<button
										key={moment.id}
										onClick={() =>
											router.push(`/flows/${flow.id}/moments/${moment.id}`)
										}
										className='border rounded-xl p-4 text-left hover:shadow-md transition bg-white'
									>
										<p className='text-sm text-gray-500 mb-1'>
											{formatDate(moment.created_at)}
										</p>
										<h2 className='text-md font-semibold'>
											{moment.title || "Untitled Moment"}
										</h2>
									</button>
								))
							)}
						</div>
					</div>
					<BottomControls />
				</div>
			</div>
		</div>
	);
}