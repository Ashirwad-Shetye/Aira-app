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
				className='p-5 border rounded-xl flex flex-col gap-5 bg-white hover:shadow duration-150'
			>
				<div className='flex items-center gap-3'>
					{latestFlow && (
						<p className='text-sm bg-amber-600 text-white px-2 py-0.5 rounded-full w-fit'>
							Latest
						</p>
					)}
					<p className='text-gray-500'>{formatDate(flow.created_at)}</p>
				</div>
				<div className='flex flex-col gap-2'>
					<h1 className='font-epilogue text-[1.10rem]'>{flow.title}</h1>
					{flow.bio && (
						<p className='font-epilogue text-sm text-gray-500'>{flow.bio}</p>
					)}
				</div>
				<div className='flex items-center gap-2 justify-end'>
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
									<p>Menu</p>
								</TooltipContent>
							</Tooltip>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							side='top'
							align='end'
							sideOffset={5}
						>
							<DropdownMenuItem
								className='cursor-pointer'
								onClick={(e) => {
									e.stopPropagation();
									onEdit && onEdit(flow);
								}}
							>
								Edit
							</DropdownMenuItem>
							<DropdownMenuItem
								className='cursor-pointer'
								onClick={(e) => {
									e.stopPropagation();
									onDelete && onDelete(flow.id);
								}}
							>
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		);
}

export default FlowCard