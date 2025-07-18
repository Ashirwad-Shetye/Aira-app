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
import MomentCard from "@/components/flow/moment-card";

export default function FlowIdPage() {
	const { flowId } = useParams();
	const router = useRouter();
	const { data: session, status } = useSession();

	const [flow, setFlow] = useState<Flow | null>(null);
	const [moments, setMoments] = useState<Moment[]>([]);
	const [flowLoading, setFlowLoading] = useState(true);
	const [momentsLoading, setMomentsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
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
		<ScrollableHeaderLayout
			header={<HeaderNavbar />}
			scrollContainerRef={scrollContainerRef}
		>
			<div
				ref={scrollContainerRef}
				className='flex-1 flex flex-col gap-10 pb-10 relative min-h-0 overflow-y-auto p-5'
			>
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

				<div className='flex-1 flex flex-col sm:w-full md:w-[70%] max-w-7xl mx-auto min-h-0 px-5 relative'>
					<div className='flex flex-col gap-3'>
						{flowLoading ? (
							<>
								<div className='h-8 w-40 bg-gray-100 animate-pulse rounded' />
								<div className='h-40 w-full bg-gray-100 animate-pulse rounded' />
							</>
						) : (
							<>
								<h1 className='font-figtree font-semibold text-2xl'>
									{flow?.title || "Untitled Flow"}
								</h1>
								{flow?.bio ? (
									<p className='font-figtree'>{flow?.bio || ""}</p>
								) : (
									<p className=''>Add bio</p>
								)}
							</>
						)}
					</div>

					{/* Search bar - Sticky when scrolled to its position */}
					<div className='sticky -top-5 z-40 w-full'>
						<div className='h-6 w-full bg-white' />
						<div className='w-full bg-white'>
							<div className='flex items-center bg-white rounded-full gap-2 border w-[40%] min-w-80 px-3 py-1.5'>
								<Icons.search />
								<input
									type='text'
									placeholder='Search your moments'
									className='text-gray-800 w-full font-cabin focus:ring-0 outline-none'
								/>
							</div>
						</div>
						<div className='h-6 w-full bg-gradient-to-t from-transparent via-white/90 to-white' />
					</div>

					{/* Moments grid */}
					{momentsLoading ? (
						<div className='flex flex-col gap-3'>
							<h2>Moments</h2>
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2'>
								{Array.from({ length: 6 }).map((_, i) => (
									<div
										key={i}
										className='h-32 bg-gray-100 animate-pulse rounded-xl'
									/>
								))}
							</div>
						</div>
					) : moments.length === 0 ? (
						<p className='text-muted-foreground mt-4'>
							No moments yet. Add your first one.
						</p>
					) : (
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2 pb-10'>
							{moments.map((moment) => (
								<MomentCard
									key={moment.id}
									moment={moment}
									flow={flow}
								/>
							))}
						</div>
					)}
				</div>
			</div>
			<BottomControls />
		</ScrollableHeaderLayout>
	);
}
