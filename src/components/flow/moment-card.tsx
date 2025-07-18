"use client"

import { formatDate } from '@/lib/date-convertors';
import { Flow } from '@/types/flows';
import { Moment } from '@/types/moments';
import { useRouter } from 'next/navigation';
import React from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import Icons from '../ui/icons';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

type Props = {
    moment: Moment
    flow: Flow | null
}

const MomentCard = ( {
    moment,
    flow
}: Props ) => {
    const flowId = flow?.id
    const router = useRouter();

    const handleOpenMoment = (momentId: string) => {
        router.push(`/flows/${flowId}/${momentId}`);
    };
    
    return (
			<div
				key={moment.id}
				onClick={() => router.push(`/flows/${flowId}/${moment.id}`)}
				className='border rounded-xl p-4 text-left hover:shadow transition bg-white'
			>
				<p className='text-sm text-gray-500 mb-1'>
					{formatDate(moment.created_at)}
				</p>
				<h2 className='text-md font-semibold'>
					{moment.title || "Untitled Moment"}
				</h2>
				<div className='flex items-center gap-2 justify-end'>
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								type='button'
								onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenMoment(moment.id)
								}}
								className='cursor-pointer text-gray-500 h-6 w-6 flex items-center justify-center rounded hover:bg-gray-100 duration-150 active:scale-95'
							>
								<Icons.edit />
							</button>
						</TooltipTrigger>
						<TooltipContent
							side='bottom'
							sideOffset={5}
						>
							<p>Edit</p>
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
									<p>More</p>
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
								}}
							>
								Edit
							</DropdownMenuItem>
							<DropdownMenuItem
								className='cursor-pointer'
								onClick={(e) => {
									e.stopPropagation();
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

export default MomentCard