"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import Icons from "../ui/icons";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { formatDate } from "@/lib/date-convertors";
import { NewFlowDialog } from "../new-flow-dialog/new-flow-dialog";

type RecentFlow = {
	id: string;
	title: string;
	bio: string;
	user_id: string;
	created_at: string;
	last_activity: string;
	moment_count: number;
};

const SingleRecentFlowCard = () => {
	const [flow, setFlow] = useState<RecentFlow | null>(null);
    const [ isLoading, setIsLoading ] = useState( true );
    const [dialogOpen, setDialogOpen] = useState(false);
	const { data: session } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (!session?.user?.id) return;

		const fetchRecentFlow = async () => {
			setIsLoading(true);
			const { data, error } = await supabase.rpc(
				"top_flows_by_recent_activity",
				{
					user_id_input: session.user.id,
				}
			);

			if (error) {
				console.error("❌ Failed to fetch recent flow:", error);
			} else if (data && data.length > 0) {
				setFlow(data[0]);
			}
			setIsLoading(false); // ✅ Always set loading false
		};

		fetchRecentFlow();
    }, [ session?.user?.id ] );
    
    async function handleSaveFlow(data: {
        id?: string;
        title: string;
        bio?: string;
    }) {
        if (!data.id) return;
        setIsLoading(true);
        const { error } = await supabase
            .from("flows")
            .update({ title: data.title, bio: data.bio })
            .eq("id", data.id);
        if (error) {
            setIsLoading(false);
            return;
        }
        setDialogOpen(false);
        setIsLoading(false);
    }

    const handleOpenFlow = (flowId: string) => {
			router.push(`/flows/${flowId}`);
		};

		const handleCreateNewMoment = async (flowId: string) => {
			try {
				const { data, error } = await supabase
					.from("moments")
					.insert({
						title: "Untitled Moment",
						content: "",
						snippet: "",
						flow_id: flowId,
						user_id: session?.user?.id,
					})
					.select("id")
					.single();

				if (error || !data?.id) {
					console.error("Failed to create moment:", error);
					return;
				}

				router.push(`/flows/${flowId}/${data.id}`);
			} catch (err) {
				console.error("Moment creation failed:", err);
			}
		};

	if (isLoading) {
		return (
			<div className='w-full flex-1 rounded-lg flex flex-col gap-4 p-3 bg-white text-center text-sm text-muted-foreground'>
				<div className='flex items-center justify-between'>
					<div className='w-40 h-10 rounded animate-pulse bg-gray-100' />
					<div className='flex items-center gap-3'>
						<div className='w-24 h-10 rounded animate-pulse bg-gray-100' />
						<div className='w-24 h-10 rounded animate-pulse bg-gray-100' />
					</div>
				</div>
				<div className='flex-1 rounded-md text-muted-foreground bg-muted/50 animate-pulse' />
			</div>
		);
	}

	if (!flow) {
		return (
			<div className='w-full flex-1 rounded-lg flex flex-col gap-4 p-5 relative overflow-hidden bg-white'>
				<div className='flex items-center justify-between'>
					<div className='flex flex-col gap-0.5 text-left'>
						<div className='flex items-center gap-1 font-semibold'>
							<Icons.flow />
							<h1 className='  text-base'>Latest Flow</h1>
						</div>
						<p className='text-sm'>Pick up where you left off.</p>
					</div>
				</div>
				<div className='p-4 flex-1 flex flex-col gap-2 items-center justify-center rounded-lg duration-150 cursor-pointer bg-radial from-white via-white/30 backdrop-blur-md to-transparent'>
					<p className='text-muted-foreground'>
						No recent flows yet. Start writing your first one!
					</p>
					<NewFlowDialog
						open={dialogOpen}
						onOpenChange={(open) => {
							setDialogOpen(open);
						}}
						onSave={handleSaveFlow}
						children={
							<Button
								variant='primary'
								size='sm'
							>
								New
							</Button>
						}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className='w-full flex-1 rounded-lg flex flex-col gap-4 p-5 relative overflow-hidden bg-white'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div className='flex flex-col gap-0.5'>
					<div className='flex items-center gap-1 font-semibold'>
						<Icons.flow />
						<h1 className='  text-base'>Latest Flow</h1>
					</div>
					<p className='text-sm text-muted-foreground'>
						Pick up where you left off.
					</p>
				</div>
				<div className='flex items-center gap-3'>
					<NewFlowDialog
						open={dialogOpen}
						onOpenChange={(open) => {
							setDialogOpen(open);
						}}
						onSave={handleSaveFlow}
						children={
							<NewFlowDialog
								open={dialogOpen}
								onOpenChange={(open) => {
									setDialogOpen(open);
								}}
								onSave={handleSaveFlow}
								children={
									<Button
										variant='primary'
										size='sm'
									>
										New
									</Button>
								}
							/>
						}
					/>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant='secondary'
								size='sm'
								onClick={() => router.push(`/flows`)}
							>
								View all
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Show all created flows</p>
						</TooltipContent>
					</Tooltip>
				</div>
			</div>

			{/* Card */}
			<div
				className='flex-1 rounded-lg duration-150 flex flex-col justify-between cursor-pointer '
				onClick={() => router.push(`/flows/${flow.id}`)}
			>
				<div className='flex flex-col gap-0.5'>
					<div className='flex items-center justify-between gap-10'>
						<p className='text-gray-500'>{formatDate(flow.created_at)}</p>
						{flow.moment_count !== 0 && (
							<Tooltip>
								<TooltipTrigger asChild>
									<p className='truncate text-xs text-muted-foreground'>
										Last updated: {formatDate(flow.last_activity)}
									</p>
								</TooltipTrigger>
								<TooltipContent>
									<p>{formatDate(flow.last_activity)}</p>
								</TooltipContent>
							</Tooltip>
						)}
					</div>
					<h2 className='font-semibold text-lg line-clamp-2 text-wrap truncate text-gray-600'>
						{flow.title || "Untitled Flow"}
					</h2>
					<p className='text-sm text-muted-foreground line-clamp-3 text-wrap truncate'>
						{flow.bio || "No description added yet."}
					</p>
				</div>

				<div className='flex justify-between text-gray-500'>
					<p className='text-sm'>
						{flow.moment_count} {flow.moment_count === 1 ? "moment" : "moments"}
					</p>
					<div className='flex items-center gap-2 text-gray-500'>
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									type='button'
									onClick={(e) => {
										e.stopPropagation();
										handleOpenFlow(flow.id);
									}}
									className='cursor-pointer text-gray-500 h-6 w-6 flex items-center justify-center rounded hover:bg-gray-100 duration-150 active:scale-95'
								>
									<Icons.moment />
								</button>
							</TooltipTrigger>
							<TooltipContent
								side='bottom'
								sideOffset={5}
							>
								<p>Moments</p>
							</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									type='button'
									onClick={(e) => {
										e.stopPropagation();
										handleCreateNewMoment(flow.id);
									}}
									className='cursor-pointer text-gray-500 h-6 w-6 flex items-center justify-center rounded hover:bg-gray-100 duration-150 active:scale-95'
								>
									<Icons.add />
								</button>
							</TooltipTrigger>
							<TooltipContent
								side='bottom'
								sideOffset={5}
							>
								<p>Add a new moment</p>
							</TooltipContent>
						</Tooltip>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SingleRecentFlowCard;