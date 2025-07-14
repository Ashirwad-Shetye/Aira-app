// src/app/flows/page.tsx
"use client";

import { useEffect, useState } from "react";
import BottomControls from "@/components/bottom-controls/bottom-controls";
import LeftNavbar from "@/components/left-navbar/left-navbar";
import { NewFlowDialog } from "@/components/new-flow-dialog/new-flow-dialog";
import TagsBar from "@/components/tags-bar/tags-bar";
import Icons from "@/components/ui/icons";
import { useSession } from "next-auth/react";
import { Flow } from "@/types/flows";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import FlowCard from "@/components/flow/flow-card";

const Flows = () => {
	const [flows, setFlows] = useState<Flow[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { data: session, status } = useSession();
	const [hasFetched, setHasFetched] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editFlow, setEditFlow] = useState<Flow | null>(null);
	const router = useRouter();

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
		if (
			hasFetched ||
			status !== "authenticated" ||
			!session?.user?.id
		) {
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

	async function handleDeleteFlow(flowId: string) {
		setIsLoading(true);
		setError(null);
		const { error } = await supabase
			.from("flows")
			.delete()
			.eq("id", flowId);
		if (error) {
			setError(error.message);
			setIsLoading(false);
			return;
		}
		setFlows((prev) => prev.filter(f => f.id !== flowId));
		setIsLoading(false);
	}

	async function handleSaveFlow(data: { id?: string; title: string; bio?: string }) {
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
		setFlows((prev) => prev.map(f => f.id === data.id ? { ...f, title: data.title, bio: data.bio } : f));
		setDialogOpen(false);
		setEditFlow(null);
		setIsLoading(false);
	}

	return (
		<div className='p-5 flex flex-col overflow-hidden relative w-full flex-1'>
			<div className='flex gap-5 flex-1 relative'>
				<LeftNavbar />
				<div className='flex flex-col overflow-hidden relative w-full'>
					<div className='flex-1 flex flex-col gap-5 relative'>
						<h1 className='font-pt-sans text-2xl'>Your Flows</h1>
						<div className='flex-1 flex flex-col gap-5 relative overflow-hidden'>
							<div>
								<div className='flex items-center bg-white rounded-full gap-2 border w-[40%] min-w-80 px-3 py-1.5'>
									<Icons.search aria-hidden='true' />
									<input
										type='text'
										placeholder='Search your last flows'
										className='text-gray-800 w-full font-cabin focus:ring-0 outline-none'
										aria-label='Search flows'
									/>
								</div>
							</div>
							{error && (
								<div aria-live='polite' className='text-destructive'>
									{error}
								</div>
							)}
							<div className='flex gap-5'>
								<NewFlowDialog
									open={dialogOpen}
									onOpenChange={(open) => {
										setDialogOpen(open);
										if (!open) setEditFlow(null);
									}}
									flow={editFlow ?? undefined}
									onSave={editFlow ? handleSaveFlow : undefined}
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
							<TagsBar tags={tags} />
							{isLoading ? (
								<div aria-live='polite'>Loading flows...</div>
							) : (
								<>
									<div className=''>
										{flows.length === 0 ? (
											<div className=''>
												<p aria-live='polite'>
													No flows found. Create one to get started!
												</p>
											</div>
										) : (
											<div className='grid grid-cols-4'>
												{flows.map((flow, idx) => (
													<FlowCard
														key={`${flow.id}_${idx}`}
														flow={flow}
														latestFlow={flow.id === flows[0].id}
														onEdit={handleEditFlow}
														onDelete={handleDeleteFlow}
													/>
												))}
											</div>
										)}
									</div>
								</>
							)}
						</div>
						<BottomControls />
					</div>
				</div>
			</div>
		</div>
	);
};

export default Flows;