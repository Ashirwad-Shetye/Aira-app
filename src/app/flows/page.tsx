"use client";

import { useEffect, useRef, useState } from "react";
import BottomControls from "@/components/bottom-controls/bottom-controls";
import LeftNavbar from "@/components/left-navbar/left-navbar";
import { NewFlowDialog } from "@/components/new-flow-dialog/new-flow-dialog";
import TagsBar from "@/components/tags-bar/tags-bar";
import Icons from "@/components/ui/icons";
import { useSession } from "next-auth/react";
import { Flow } from "@/types/flows";
import { supabase } from "@/lib/supabase/client";
import FlowCard from "@/components/flow/flow-card";
import ScrollableHeaderLayout from "@/components/layouts/scrollable-header-layout";
import HeaderNavbar from "@/components/header-navbar/header-navbar";
import { ConfirmDialog } from "@/components/custom-alert-dialog/confirm-dialog";
import { toast } from "sonner";

const Flows = () => {
	const [flows, setFlows] = useState<Flow[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { data: session, status } = useSession();
	const [hasFetched, setHasFetched] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editFlow, setEditFlow] = useState<Flow | null>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
	const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
	const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

	const tags = [
		"mindfulness",
		"self help",
		"meditation",
		"personal growth",
		"mental health",
		"gratitude",
		"self care",
		"motivation",
		"reflection",
		"productivity",
		"wellness",
		"stress relief",
		"goal setting",
		"positive thinking",
		"emotional intelligence",
		"self discovery",
		"resilience",
		"habits",
		"self love",
		"mindset",
		"balance",
		"inner peace",
		"journaling",
		"self improvement",
		"awareness",
		"focus",
		"inspiration",
		"daily logs",
		"special",
		"random",
	];

	useEffect(() => {
		if (hasFetched || status !== "authenticated" || !session?.user?.id) {
			return;
		}

		async function fetchFlows() {
			setIsLoading(true);
			setError(null);

			try {
				if (!session || !session.user?.id) {
					setIsLoading(false);
					return;
				}
				const { data, error } = await supabase
					.from("flows")
					.select("id, title, bio, created_at, updated_at, user_id")
					.eq("user_id", session.user.id)
					.order("created_at", { ascending: false });

				if (error) {
					throw new Error(`Error fetching flows: ${error.message}`);
				}

				setFlows(data);
				setHasFetched(true);
			} catch (error: any) {
				console.error(error);
				setError(error.message);
			} finally {
				setIsLoading(false);
			}
		}

		fetchFlows();
	}, [session, status, hasFetched]);

	const handleEditFlow = (flow: Flow) => {
		setEditFlow(flow);
		setDialogOpen(true);
	};

	const handleDeleteFlow = (flowId: string) => {
		const flow = flows.find((f) => f.id === flowId);
		if (!flow) return;
		setSelectedFlow(flow);
		setConfirmDialogOpen(true);
	};

	const confirmDelete = async () => {
		if (!selectedFlow) return;
		setDeletingIds((prev) => new Set(prev).add(selectedFlow.id));
		// Optionally, show a toast here for deleting
		const { error } = await supabase.from("flows").delete().eq("id", selectedFlow.id);
		if (!error) {
			setFlows((prev) => prev.filter((f) => f.id !== selectedFlow.id));
			toast.success("Flow deleted successfully.");
		} else {
			toast.error("Failed to delete flow.");
			setError(error.message);
		}
		setDeletingIds((prev) => {
			const next = new Set(prev);
			next.delete(selectedFlow.id);
			return next;
		});
		setConfirmDialogOpen(false);
		setSelectedFlow(null);
	};

	async function handleSaveFlow(data: {
		id?: string;
		title: string;
		bio?: string;
	}) {
		if (!data.id) return;
		setIsLoading(true);
		setError(null);
		const { error } = await supabase
			.from("flows")
			.update({ title: data.title, bio: data.bio })
			.eq("id", data.id);
		if (error) {
			setError(error.message);
			setIsLoading(false);
			return;
		}
		setFlows((prev) =>
			prev.map((f) =>
				f.id === data.id ? { ...f, title: data.title, bio: data.bio } : f
			)
		);
		setDialogOpen(false);
		setEditFlow(null);
		setIsLoading(false);
	}

	return (
		<ScrollableHeaderLayout
			header={<HeaderNavbar />}
			scrollContainerRef={scrollContainerRef}
		>
			<div
				ref={scrollContainerRef}
				className='flex-1 flex flex-col gap-10 pb-10 min-h-screen overflow-y-auto p-5'
			>
				<div className='flex flex-col sm:w-full md:w-[70%] max-w-7xl mx-auto min-h-0 px-5'>
					<h1 className='font-pt-sans text-2xl'>Your Flows</h1>
					<div className='flex-1 flex flex-col'>
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
							<div className='h-6 w-full bg-white' />
						</div>
						{error && (
							<div
								aria-live='polite'
								className='text-destructive'
							>
								{error}
							</div>
						)}
						<div className='flex gap-5 pb-5'>
							<NewFlowDialog
								open={dialogOpen}
								onOpenChange={(open) => {
									setDialogOpen(open);
									if (!open) setEditFlow(null);
								}}
								flow={editFlow ?? undefined}
								onSave={editFlow ? handleSaveFlow : undefined}
								children={
									<button
										type='button'
										className='px-10 h-20 group cursor-pointer select-none font-pt-sans text-lg font-semibold rounded-lg text-white bg-gradient-to-br from-[#DFEDFF] via-[#B2CEF3] to-[#DFEDFF] flex items-center justify-center'
									>
										<div className='group-hover:scale-105 gap-2 duration-200 group-active:scale-95 flex items-center justify-center'>
											<Icons.flow />
											<h1>{editFlow ? "Edit flow" : "Start a new flow"}</h1>
										</div>
									</button>
								}
							/>
							<button
								type='button'
								className='px-10 h-20 group cursor-pointer select-none font-pt-sans text-lg font-semibold rounded-lg text-white bg-gradient-to-br from-[#E8F2D9] via-[#b7da81] to-[#E8F2D9] flex items-center justify-center'
								aria-label='Create new moment in flow'
							>
								<div className='group-hover:scale-105 gap-2 duration-200 group-active:scale-95 flex items-center justify-center'>
									<Icons.moment aria-hidden='true' />
									<h1>New moment in flow</h1>
								</div>
							</button>
						</div>
						<div className='sticky top-14 z-40 w-full'>
							<TagsBar tags={tags} />
							<div className='h-6 w-full bg-gradient-to-t from-transparent via-white/90 to-white' />
						</div>
						{isLoading ? (
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10'>
								{Array.from({ length: 4 }).map((_, i) => (
									<div
										key={i}
										className='h-80 bg-gray-100 animate-pulse rounded-xl'
									/>
								))}
							</div>
						) : (
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10'>
								{flows.length === 0 ? (
									<p aria-live='polite'>
										No flows found. Create one to get started!
									</p>
								) : (
									flows.map((flow, idx) => (
										<FlowCard
											key={`${flow.id}_${idx}`}
											flow={flow}
											latestFlow={flow.id === flows[0].id}
											onEdit={handleEditFlow}
											onDelete={handleDeleteFlow}
										/>
									))
								)}
							</div>
						)}
						{/* Optional: Add padding to ensure content height for testing */}
						<div className='pb-[1000px]' />
					</div>
				</div>
			</div>
			<BottomControls />
			<ConfirmDialog
				open={confirmDialogOpen}
				onOpenChange={setConfirmDialogOpen}
				title='Delete this flow?'
				description='This action cannot be undone.'
				confirmText='Delete'
				onConfirm={confirmDelete}
			/>
		</ScrollableHeaderLayout>
	);
};

export default Flows;
