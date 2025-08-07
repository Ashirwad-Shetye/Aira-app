 "use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

import { formatDate } from "@/lib/date-convertors";
import { Flow } from "@/types/flows";
import { Moment } from "@/types/moments";
import Icons from "../ui/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useSession } from "next-auth/react";
import AuthorCard from "../ui/author-card";

type Props = {
	moment: Moment;
	flow: Flow | null;
	isNew?: boolean;
	isDeleting?: boolean;
	onRename?: (moment: Moment) => void;
	onDuplicate?: (moment: Moment) => void;
	onDelete?: ( moment: Moment ) => void;
	latestMoment:boolean
};

const MomentCard = ({
	moment,
	flow,
	isNew = false,
	isDeleting = false,
	onRename,
	onDuplicate,
	onDelete,
	latestMoment,
}: Props) => {
	const router = useRouter();
	const flowId = flow?.id;
	const { data: session } = useSession();

	const [animateIn, setAnimateIn] = useState(false);
	const [animateOut, setAnimateOut] = useState(false);

	// Animate in on mount if it's a new moment
	useEffect(() => {
		if (isNew) {
			requestAnimationFrame(() => setAnimateIn(true));
		}
	}, [isNew]);

	// Animate out on delete
	useEffect(() => {
		if (isDeleting) {
			setAnimateOut(true);
		}
	}, [isDeleting]);

	const handleOpenMoment = (momentId: string) => {
		if (!flowId) {
			return;
		}
		if (flow.type === "personal") {
			router.push(`/flows/${flowId}/${momentId}`);
		} else {
			router.push(`/flows/${flowId}/${momentId}?type=shared`);
		}
	};

	const isEditable =
		moment.type === "personal" || (session?.user?.id && moment.author?.user_id === session.user.id);

	return (
		<div
			onClick={() => handleOpenMoment(moment.id)}
			className={clsx(
				"p-5 bg-accent flex flex-col hover:shadow justify-between transition-all duration-300 ease-in-out transform rounded-md",
				{
					"opacity-0 scale-95": (isNew && !animateIn) || animateOut,
					"opacity-100 scale-100": isNew && animateIn,
				}
			)}
		>
			{/* Header */}
			<div className='flex flex-col gap-5 relative'>
				<div className='flex items-center gap-3'>
					{latestMoment && (
						<p className='text-xs bg-amber-600 text-white px-2 py-0.5 w-fit'>
							Latest
						</p>
					)}
					<p className='text-sm text-gray-500'>
						{formatDate(moment.created_at)}
					</p>
				</div>
				<h2 className='text-lg font-semibold font-libre text-wrap line-clamp-3 truncate'>
					{moment.title || "Untitled Moment"}
				</h2>
				{moment.snippet && (
					<p className='text-sm text-muted-foreground line-clamp-3 mt-1'>
						{moment.snippet}
					</p>
				)}
			</div>

			{/* Footer */}
			<div className='flex flex-col gap-2 mt-3'>
				{!isEditable && moment.author && (
					<div className='w-fit'>
						<AuthorCard author={moment.author} />
					</div>
				)}
				<div className='flex items-center gap-5 justify-between'>
					{moment.updated_at && (
						<p className='text-xs text-gray-500 truncate'>
							Last edited: {formatDate(moment.updated_at)}
						</p>
					)}

					<div className='flex items-center gap-2'>
						{isEditable && (
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										type='button'
										onClick={(e) => {
											e.stopPropagation();
											handleOpenMoment(moment.id);
										}}
										className='cursor-pointer text-gray-500 h-6 w-6 flex items-center justify-center hover:bg-gray-100 duration-150 active:scale-95'
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
						)}

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
								{isEditable && (
									<DropdownMenuItem
										className='cursor-pointer'
										onClick={(e) => {
											e.stopPropagation();
											onRename?.(moment);
										}}
									>
										Rename
									</DropdownMenuItem>
								)}
								{(isEditable || (flow?.owner_id !== undefined && flow.owner_id === session?.user.id)) && (
									<DropdownMenuItem
										className='cursor-pointer text-red-600'
										onClick={(e) => {
											e.stopPropagation();
											onDelete?.(moment);
										}}
									>
										Delete
									</DropdownMenuItem>
								)}
								<DropdownMenuItem
									className='cursor-pointer'
									onClick={(e) => {
										e.stopPropagation();
										onDuplicate?.(moment);
									}}
								>
									Duplicate
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MomentCard;