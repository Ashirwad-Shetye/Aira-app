// src/app/diaries/page.tsx
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
import { formatDate } from "@/lib/date-convertors";

const Flows = () => {
	const [flows, setFlows] = useState<Flow[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { data: session, status } = useSession();
	const [hasFetched, setHasFetched] = useState(false);
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
					.select("*")
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
	
	const handleOpenFlow = (flowId: string) => {
    router.push(`/flows/${flowId}`);
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
								<div
									aria-live='polite'
									className='text-destructive'
								>
									{error}
								</div>
							)}
							<div className='flex gap-5'>
								<NewFlowDialog />
								<button
									type='button'
									className='px-10 h-20 group cursor-pointer select-none font-pt-sans text-lg font-semibold rounded-lg text-white bg-gradient-to-br from-[#b7da81] to-[#E8F2D9] flex items-center justify-center'
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
													<div
														onClick={() => handleOpenFlow(flow.id)}
														key={`${flow.id}_${idx}`}
														className='p-5 border rounded-xl flex flex-col gap-5 bg-white hover:shadow duration-150'
													>
														<div className='flex items-center gap-5'>
															{flow.id === flows[0].id && (
																<p className='text-sm bg-amber-600 text-white px-2 py-0.5 rounded-full w-fit'>
																	Latest
																</p>
															)}
															<p className="text-gray-500">{formatDate(flow.created_at)}</p>
														</div>
														<div className="flex flex-col gap-2">
															<h1 className='font-epilogue text-[1.25rem]'>
																{flow.title}
															</h1>
															{flow.bio && <p>{flow.bio}</p>}
															<p className="font-epilogue text-sm text-gray-500">
																Capture and turn your voice recordings, text
																notes, images, audio files, and YouTube videos
																into perfect notes for meetings, journals,
																lectures, emails, and more!
															</p>
														</div>
														<div>
															{/* controls */}
														</div>
													</div>
												))}
											</div>
										)}
									</div>
								</>
							)}
						</div>
					</div>
					<BottomControls />
				</div>
			</div>
		</div>
	);
};

export default Flows;