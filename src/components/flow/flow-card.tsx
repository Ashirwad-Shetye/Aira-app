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
				className='border rounded-xl p-4 bg-white flex flex-col gap-3 hover:shadow justify-between transition-all duration-300 ease-in-out transform'
			>
				<div className='flex flex-col gap-1 relative cursor-default'>
					{flow.cover_photo_url ? (
						<div className='relative w-full aspect-[4/1] rounded-lg group overflow-hidden bg-muted/50'>
							{flow.cover_photo_blurhash && (
								<BlurhashCanvas
									hash={flow.cover_photo_blurhash}
									width={32}
									height={8}
									punch={1}
								/>
							)}
							<Image
								src={flow.cover_photo_url}
								alt='Cover'
								className='w-full h-full object-cover transition-opacity duration-300 relative z-10'
								loading='lazy'
								onLoad={(e) => {
									e.currentTarget.style.opacity = "1";
								}}
								height={2000}
								width={2000}
								style={{
									opacity: flow.cover_photo_blurhash ? 0 : 1,
									position: "absolute",
									top: 0,
									left: 0,
								}}
								unoptimized
							/>
						</div>
					) : (
						<div className='relative w-full aspect-[4/1] rounded-lg group overflow-hidden bg-muted/50'>
							{flow.cover_photo_blurhash && (
								<BlurhashCanvas
									hash={flow.cover_photo_blurhash}
									width={32}
									height={8}
									punch={1}
								/>
							)}
						</div>
					)}
					<div className='flex items-center gap-3 pt-2'>
						{latestFlow && (
							<p className='text-sm bg-amber-600 text-white px-2 py-0.5 rounded-full w-fit'>
								Latest
							</p>
						)}
						<p className='text-gray-500'>{formatDate(flow.created_at)}</p>
					</div>
					<h1 className='text-md font-semibold text-wrap line-clamp-3 truncate'>
						{flow.title}
					</h1>
					{flow.bio && (
						<p className='text-sm text-muted-foreground line-clamp-3 mt-1'>
							{flow.bio}
						</p>
					)}
				</div>
				<div className='flex flex-col gap-2'>
					<div className='flex items-center justify-between text-sm cursor-default'>
						<p className='text-xs text-gray-400'>
							Last activity:{" "}
							{flow.last_activity ? formatDate(flow.last_activity) : "—"}
						</p>
					</div>
					<div className='flex items-center gap-5 justify-between w-full'>
						<div className='text-sm'>
							<p className='text-muted-foreground bg-muted px-2 py-0.5 rounded cursor-default'>
								{flow.moment_count ?? 0}{" "}
								{flow.moment_count === 1 ? "moment" : "moments"}
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
							{onEdit && onDelete ? (
								<DropdownMenu>
									<DropdownMenuTrigger className='outline-none focus:ring-0 cursor-pointer'>
										<Tooltip>
											<TooltipTrigger asChild>
												<div
													onClick={(e) => e.stopPropagation()}
													className='cursor-pointer text-gray-500 h-6 w-6 flex items-center justify-center rounded hover:bg-gray-100 duration-150 active:scale-95'
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
													className='cursor-pointer text-gray-500 h-6 w-6 flex items-center justify-center rounded hover:bg-gray-100 hover:text-red-400 duration-150 active:scale-95'
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