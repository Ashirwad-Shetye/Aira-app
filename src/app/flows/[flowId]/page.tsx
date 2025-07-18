"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase/client";
import { Flow } from "@/types/flows";
import { Moment } from "@/types/moments";
import { Button } from "@/components/ui/button";
import Icons from "@/components/ui/icons";
import { formatDate } from "@/lib/date-convertors";
import BottomControls from "@/components/bottom-controls/bottom-controls";
import HeaderNavbar from "@/components/header-navbar/header-navbar";
import ScrollableHeaderLayout from "@/components/layouts/scrollable-header-layout";
import CustomBreadcrumb from "@/components/custom-breadcrumb/custom-breadcrumb";

export default function FlowIdPage() {
	const { flowId } = useParams();
	const router = useRouter();
	const { data: session, status } = useSession();

	const [flow, setFlow] = useState<Flow | null>(null);
	const [moments, setMoments] = useState<Moment[]>([]);
	const [flowLoading, setFlowLoading] = useState(true);
	const [momentsLoading, setMomentsLoading] = useState(true);
	const [ error, setError ] = useState<string | null>( null );
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	// Fetch flow metadata
	useEffect(() => {
		if (!flowId || typeof flowId !== "string") return;
		if (status !== "authenticated" || !session?.user?.id) return;

		const fetchFlow = async () => {
			setFlowLoading(true);
			try {
				const { data, error } = await supabase
					.from("flows")
					.select("id, title, bio, created_at, user_id")
					.eq("id", flowId)
					.single();

				if (error || !data) throw error || new Error("Flow not found");
				setFlow(data);
			} catch (err: any) {
				console.error("❌ Error loading flow:", err.message);
				setError("Failed to load flow.");
			} finally {
				setFlowLoading(false);
			}
		};

		fetchFlow();
	}, [flowId, status, session?.user?.id]);

	// Fetch moments (after flow is available)
	useEffect(() => {
		if (!flowId || typeof flowId !== "string") return;
		if (!flow) return;

		const fetchMoments = async () => {
			setMomentsLoading(true);
			try {
				const { data, error } = await supabase
					.from("moments")
					.select("id, title, created_at")
					.eq("flow_id", flowId)
					.order("created_at", { ascending: false });

				if (error) throw error;
				setMoments(data ?? []);
			} catch (err: any) {
				console.error("❌ Error loading moments:", err.message);
			} finally {
				setMomentsLoading(false);
			}
		};

		fetchMoments();
	}, [flowId, flow]);

	// Handle initial error
	if (error) {
		return (
			<div className='p-5 flex flex-col items-center justify-center text-red-500 text-center'>
				<p>{error}</p>
			</div>
		);
	}

	return (
		<ScrollableHeaderLayout header={<HeaderNavbar />}>
			<div className='flex-1 flex flex-col gap-5 p-5 relative'>
				{/* Flow header */}
				<div className='flex items-center gap-5'>
					<Button
						variant='secondary'
						onClick={() => router.back()}
						className='flex items-center gap-1 text-gray-500'
					>
						<Icons.arrowLeft />
						<p>Back</p>
					</Button>
					<CustomBreadcrumb
						flowId={flowId as string}
						flowTitle={flow?.title}
						isLoading={flowLoading}
					/>
				</div>

				<div className='flex flex-col gap-5'>
					{flowLoading ? (
						<div className='h-8 w-40 bg-gray-100 animate-pulse rounded' />
					) : (
						<h1 className='font-pt-sans font-semibold text-2xl'>
							{flow?.title || "Untitled Flow"}
						</h1>
					)}
				</div>
				{/* Search bar */}
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

				{/* Moments grid */}
				{momentsLoading ? (
					<div className='grid grid-cols-3 gap-4 mt-2'>
						{Array.from({ length: 3 }).map((_, i) => (
							<div
								key={i}
								className='h-32 bg-gray-100 animate-pulse rounded-xl'
							/>
						))}
					</div>
				) : moments.length === 0 ? (
					<p className='text-muted-foreground mt-4'>
						No moments yet. Add your first one.
					</p>
				) : (
					<div className='grid grid-cols-3 gap-4 mt-2'>
						{moments.map((moment) => (
							<button
								key={moment.id}
								onClick={() => router.push(`/flows/${flowId}/${moment.id}`)}
								className='border rounded-xl p-4 text-left hover:shadow-md transition bg-white'
							>
								<p className='text-sm text-gray-500 mb-1'>
									{formatDate(moment.created_at)}
								</p>
								<h2 className='text-md font-semibold'>
									{moment.title || "Untitled Moment"}
								</h2>
							</button>
						))}
					</div>
				)}
			</div>
			<BottomControls />
		</ScrollableHeaderLayout>
	);
}