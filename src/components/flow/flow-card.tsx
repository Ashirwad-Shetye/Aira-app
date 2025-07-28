"use client"

import { formatDate } from '@/lib/date-convertors'
import { Flow } from '@/types/flows'
import React from 'react'
import { useRouter } from "next/navigation";
import Icons from "@/components/ui/icons";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from '@/lib/supabase/client';
import { useSession } from 'next-auth/react';
import BlurhashCanvas from '@/lib/blurhash-utils';
import Image from 'next/image'
import { Badge } from '../ui/badge';

type Props = {
    flow: Flow
    latestFlow: boolean
    onEdit?: (flow: Flow) => void
    onDelete?: (flowId: string) => void
}

const FlowCard = ( { flow, latestFlow, onEdit, onDelete }: Props ) => {
	const router = useRouter();
	const {data: session} = useSession()

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


    return (
			<div
				onClick={() => handleOpenFlow(flow.id)}
				className='p-5 bg-[#fbfbfb] flex flex-col gap-5 hover:shadow justify-between transition-all duration-300 ease-in-out transform'
			>
				<div className='flex flex-col gap-5 relative cursor-default'>
					<div className='flex items-center gap-3'>
						{latestFlow && (
							<p className='text-xs bg-amber-600 text-white px-2 py-0.5 w-fit'>
								Latest
							</p>
						)}
						<p className='text-sm text-gray-500'>
							{formatDate(flow.created_at)}
						</p>
					</div>
					<h1 className='text-lg font-semibold font-libre text-wrap line-clamp-3 truncate'>
						{flow.title}
					</h1>
					{flow.bio && (
						<p className='text-sm text-muted-foreground line-clamp-3 mt-1'>
							{flow.bio}
						</p>
					)}
				</div>
				<div className='flex flex-col gap-5'>
					{flow?.tags && (
						<div className='flex flex-wrap gap-2'>
							{flow.tags.map((tag) => (
								<Badge
									key={tag}
									variant='outline'
								>
									<span>#{tag}</span>
								</Badge>
							))}
						</div>
					)}
					<div className='text-sm'>
						<p className='text-muted-foreground border bg-white rounded-xs px-2 py-0.5 cursor-default w-fit'>
							{flow.moment_count ?? 0}{" "}
							{flow.moment_count === 1 ? "moment" : "moments"}
						</p>
					</div>
					<div className='flex items-center gap-5 justify-between w-full'>
						<div className='flex items-center justify-between text-sm cursor-default'>
							<p className='text-xs text-gray-400'>
								Last activity:{" "}
								{flow.last_activity ? formatDate(flow.last_activity) : "—"}
							</p>
						</div>
						<div className='flex items-center gap-2'>
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										type='button'
										onClick={(e) => {
											e.stopPropagation();
											handleOpenFlow(flow.id);
										}}
										className='cursor-pointer text-gray-500 h-6 w-6 flex items-center justify-center hover:bg-gray-100 duration-150 active:scale-95'
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
										className='cursor-pointer text-gray-500 h-6 w-6 flex items-center justify-center hover:bg-gray-100 duration-150 active:scale-95'
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
							{onEdit && onDelete ? (
								<DropdownMenu>
									<DropdownMenuTrigger className='outline-none focus:ring-0 cursor-pointer'>
										<Tooltip>
											<TooltipTrigger asChild>
												<div
													onClick={(e) => e.stopPropagation()}
													className='cursor-pointer text-gray-500 h-6 w-6 flex items-center justify-center hover:bg-gray-100 duration-150 active:scale-95'
												>
													<Icons.menuDots />
												</div>
											</TooltipTrigger>
											<TooltipContent
												side='bottom'
												sideOffset={5}
											>
												<p>More</p>
											</TooltipContent>
										</Tooltip>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										side='top'
										align='end'
										sideOffset={5}
									>
										{onEdit && (
											<DropdownMenuItem
												className='cursor-pointer'
												onClick={(e) => {
													e.stopPropagation();
													onEdit(flow);
												}}
											>
												Edit
											</DropdownMenuItem>
										)}
										{onDelete && (
											<DropdownMenuItem
												className='cursor-pointer'
												onClick={(e) => {
													e.stopPropagation();
													onDelete(flow.id);
												}}
											>
												Delete
											</DropdownMenuItem>
										)}
									</DropdownMenuContent>
								</DropdownMenu>
							) : (
								<>
									{onDelete && (
										<Tooltip>
											<TooltipTrigger asChild>
												<button
													type='button'
													onClick={(e) => {
														e.stopPropagation();
														onDelete(flow.id);
													}}
													className='cursor-pointer text-gray-500 h-6 w-6 flex items-center justify-center hover:bg-gray-100 hover:text-red-400 duration-150 active:scale-95'
												>
													<Icons.trash />
												</button>
											</TooltipTrigger>
											<TooltipContent
												side='bottom'
												sideOffset={5}
											>
												<p>Delete</p>
											</TooltipContent>
										</Tooltip>
									)}
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		);
}

export default FlowCard