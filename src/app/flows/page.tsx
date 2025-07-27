"use client";

import { useEffect, useRef, useState } from "react";
import BottomControls from "@/components/bottom-controls/bottom-controls";
import { NewFlowDialog } from "@/components/new-flow-dialog/new-flow-dialog";
import TagsBar from "@/components/tags-bar/tags-bar";
import Icons from "@/components/ui/icons";
import { useSession } from "next-auth/react";
import { Flow } from "@/types/flows";
import { supabase, supabaseAdmin } from "@/lib/supabase/client";
import FlowCard from "@/components/flow/flow-card";
import ScrollableHeaderLayout from "@/components/layouts/scrollable-header-layout";
import HeaderNavbar from "@/components/header-navbar/header-navbar";
import { ConfirmDialog } from "@/components/custom-alert-dialog/confirm-dialog";
import { toast } from "sonner";
import { SortByComboBox } from "@/components/combo-box/sort-by-combo-box";
import { Button } from "@/components/ui/button";

const Flows = () => {
	const [flows, setFlows] = useState<Flow[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { data: session, status } = useSession();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editFlow, setEditFlow] = useState<Flow | null>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
	const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
	const [ deletingIds, setDeletingIds ] = useState<Set<string>>( new Set() );
	const [ sortByValue, setSortByValue ] = useState( "last edited" );

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

	const fetchFlows = async() => {
		setIsLoading(true);
		setError(null);

		try {
			let column = "last_activity";
			let ascending = false;

			switch (sortByValue) {
				case "last created":
					column = "created_at";
					ascending = false;
					break;
				case "last edited":
					column = "last_activity";
					ascending = false;
					break;
				case "oldest created":
					column = "created_at";
					ascending = true;
					break;
				case "oldest edited":
					column = "last_activity";
					ascending = true;
					break;
				default:
					column = "last_activity";
					ascending = false;
			}

			const { data, error } = await supabase
				.rpc("get_flows_with_moment_data", {
					user_id_input: session?.user.id,
				})
				.order(column, { ascending });

			if (error) {
				throw new Error(`Error fetching flows: ${error.message}`);
			}

			setFlows(data);
		} catch (error: any) {
			console.error(error);
			setError(error.message);
		} finally {
			setIsLoading(false);
		}
	}

	const hasFetchedRef = useRef(false);

	// 1️⃣ Initial fetch — run only once when session is ready
	useEffect(() => {
		if (
			status === "authenticated" &&
			session?.user?.id &&
			!hasFetchedRef.current
		) {
			const fetchData = async () => {
				try {
					await fetchFlows();
				} catch (error) {
					console.error(error);
				} finally {
					hasFetchedRef.current = true;
				}
			};
			fetchData();
		}
	}, [status, session]);

	// 2️⃣ Refetch on sort change — only after initial fetch
	useEffect(() => {
		if (hasFetchedRef.current) {
			fetchFlows();
		}
	}, [sortByValue]);

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

		try {
			// 1. Extract the cover photo filename from the URL
			const coverUrl = selectedFlow.cover_photo_url;
			if (coverUrl) {
				const filePath = coverUrl.split("/flow-cover-photos/")[1];
				if (filePath) {
					const { error: storageError } = await supabaseAdmin.storage
						.from("flow-cover-photos")
						.remove([filePath]);

					if (storageError) {
						console.warn(
							"⚠️ Failed to delete cover photo:",
							storageError.message
						);
					}
				}
			}

			// 2. Delete the flow
			const { error } = await supabase
				.from("flows")
				.delete()
				.eq("id", selectedFlow.id);

			if (error) {
				toast.error("Failed to delete flow.");
				setError(error.message);
			} else {
				setFlows((prev) => prev.filter((f) => f.id !== selectedFlow.id));
				toast.success("Flow deleted successfully.");
			}
		} catch (err: any) {
			console.error("❌ Error during flow deletion:", err.message);
			toast.error("An unexpected error occurred.");
		} finally {
			setDeletingIds((prev) => {
				const next = new Set(prev);
				next.delete(selectedFlow.id);
				return next;
			});
			setConfirmDialogOpen(false);
			setSelectedFlow(null);
		}
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

	const latestActivityTimestamp = flows.reduce((latest: string | null, flow) => {
		if (!latest) return flow.last_activity ?? null;
		if (!flow.last_activity) return latest;
		return new Date(flow.last_activity) > new Date(latest)
			? flow.last_activity
			: latest;
	}, null);

	return (
		<ScrollableHeaderLayout
			header={<HeaderNavbar />}
			scrollContainerRef={scrollContainerRef}
		>
			<div
				ref={scrollContainerRef}
				className='flex-1 flex flex-col gap-10 pb-10 min-h-screen overflow-y-auto p-5'
			>
				<div className='flex flex-col sm:w-full md:w-[80%] max-w-7xl mx-auto min-h-0 px-5'>
					<h1 className='font-libre font-semibold text-2xl'>Your Flows</h1>
					<div className='flex-1 flex flex-col'>
						<div className='sticky -top-5 z-40 w-full'>
							<div className='h-6 w-full bg-white' />
							<div className='w-full bg-white'>
								<div className='flex items-center bg-white rounded-full gap-2 border w-[40%] min-w-80 px-3 py-1.5'>
									<Icons.search />
									<input
										type='text'
										placeholder='Search your flows'
										className='text-gray-800 w-full font-cabin focus:ring-0 outline-none'
									/>
								</div>
							</div>
							<div className='h-6 w-full bg-white' />
						</div>
						<div className='sticky top-14 z-40 w-full'>
							<TagsBar tags={tags} />
							<div className='bg-white w-full flex items-center py-5 justify-between'>
								<NewFlowDialog
									open={dialogOpen}
									onOpenChange={(open) => {
										setDialogOpen(open);
										if (!open) setEditFlow(null);
									}}
									flow={editFlow ?? undefined}
									onSave={editFlow ? handleSaveFlow : undefined}
									children={
										<Button
											variant="primary"
											className='group cursor-pointer select-none flex items-center justify-center'
										>
											<div className='gap-2 flex items-center justify-center'>
												<Icons.flow />
												<h1>{editFlow ? "Edit flow" : "Start a new flow"}</h1>
											</div>
										</Button>
									}
								/>
								<div>
									<SortByComboBox
										value={sortByValue}
										setValue={setSortByValue}
									/>
								</div>
							</div>
							<div className='h-6 w-full bg-gradient-to-t from-transparent via-white/90 to-white' />
						</div>
						{isLoading ? (
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10'>
								{Array.from({ length: 4 }).map((_, i) => (
									<div
										key={i}
										className='h-80 bg-gray-100 animate-pulse'
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
											latestFlow={
												flow.last_activity === latestActivityTimestamp
											}
											onEdit={handleEditFlow}
											onDelete={handleDeleteFlow}
										/>
									))
								)}
							</div>
						)}
						{/* Optional: Add padding to ensure content height for testing */}
						{/* <div className='pb-[1000px]' /> */}
					</div>
				</div>
			</div>
			<BottomControls />
			<ConfirmDialog
				open={confirmDialogOpen}
				onOpenChange={setConfirmDialogOpen}
				title='Delete this flow?'
				description='Deleting this flow will permanently remove it along with all its moments. This action cannot be undone.'
				confirmText='Delete'
				onConfirm={confirmDelete}
			/>
		</ScrollableHeaderLayout>
	);
};

export default Flows;
