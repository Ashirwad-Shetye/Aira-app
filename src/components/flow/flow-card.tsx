 "use client";

import { formatDate } from '@/lib/date-convertors'
import { Flow } from '@/types/flows'
import React from 'react'
import { useRouter } from "next/navigation";
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
import { Badge } from '../ui/badge';
import MultiAvatarPopover from '../ui/members/multi-avatar-popover';
import Icons from '../ui/icons';
import { Button } from '../ui/button';
import { toast } from 'sonner';

type Props = {
	flow: Flow;
	latestFlow: boolean;
	onEdit?: (flow: Flow) => void;
	onDelete?: (flowId: string) => void;
	onRefreshFlows?: () => void;
};

const FlowCard = ( { flow, latestFlow, onEdit, onDelete, onRefreshFlows }: Props ) => {
	const router = useRouter();
	const { data: session } = useSession();
	const currentUserMember = flow.members?.find(
		(member) => member.id === session?.user?.id
	);
	const userRole = currentUserMember?.role;

	const owner = flow.members?.find((member) => member.role === "owner");
	const flowTypeLabel = flow.type === "couple" ? "couples" : flow.type;

	const handleOpenFlow = (flowId: string) => {
		if (flow.type !== "personal" && userRole === "pending") {
			toast.error("You need to accept the invite to access this shared flow");
			return;
		}

		if (flow.type === "personal") {
			router.push(`/flows/${flowId}`);
		} else {
			router.push(`/flows/${flow.id}?type=shared`);
		}
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

	const handleAcceptInvite = async (flowId: string) => {
		if (!session?.user?.id) {
			toast.error("You must be logged in to accept the invite.");
			return;
		}

		const { error } = await supabase
			.from("shared_flow_participants")
			.update({ role: "member" })
			.eq("flow_id", flowId)
			.eq("user_id", session.user.id)
			.eq("role", "pending");

		if (error) {
			console.error("❌ Failed to accept invite:", error);
			toast.error("Could not accept invite. Please try again.");
			return;
		}

		toast.success("Invite accepted! You are now a member of this flow.");
		onRefreshFlows?.();
	};
	
	const handleDeclineInvite = async (flowId: string) => {
		if (!session?.user?.id) {
			toast.error("You must be logged in to decline the invite.");
			return;
		}

		const { error } = await supabase
			.from("shared_flow_participants")
			.delete()
			.eq("flow_id", flowId)
			.eq("user_id", session.user.id)
			.eq("role", "pending");

		if (error) {
			console.error("❌ Failed to decline invite:", error);
			toast.error("Could not decline invite. Please try again.");
			return;
		}

		toast.success("You’ve declined the invite.");
		onRefreshFlows?.();
	};

	return (
		<div
			onClick={() => handleOpenFlow(flow.id)}
			className='p-5 bg-accent flex flex-col gap-5 hover:shadow rounded-md justify-between transition-all duration-300 ease-in-out transform'
		>
			<div className='flex flex-col gap-5 relative cursor-default'>
				<div className='flex items-center justify-between w-full'>
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
					{flow.type !== undefined && flow.type !== "personal" && (
						<Tooltip>
							<TooltipTrigger asChild>
								<div
									onClick={(e) => e.stopPropagation()}
									className='cursor-default p-1 text-primary w-fit'
								>
									{flow.type === "shared" && <Icons.shared />}
									{flow.type === "couple" && <Icons.couple />}
								</div>
							</TooltipTrigger>
							<TooltipContent
								side='bottom'
								sideOffset={5}
							>
								<p>{`${flow.type} flow`}</p>
							</TooltipContent>
						</Tooltip>
					)}
				</div>
				<div className='flex flex-col gap-2'>
					<h1 className='text-lg font-semibold font-libre text-wrap line-clamp-3 truncate'>
						{flow.title}
					</h1>
					{flow.bio && (
						<p className='text-sm text-muted-foreground line-clamp-3'>
							{flow.bio}
						</p>
					)}
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
				</div>
			</div>
			<div className='flex flex-col gap-3'>
				<div className='text-sm flex items-center justify-between pt-2'>
					<div className='flex items-center gap-5'>
						<p className='text-muted-foreground border bg-white text-xs rounded-md px-2 py-0.5 cursor-default w-fit'>
							{flow.moment_count ?? 0}{" "}
							{flow.moment_count === 1 ? "moment" : "moments"}
						</p>
						{flow?.unread_count !== undefined && flow?.unread_count !== 0 && (
							<>
								<Tooltip>
									<TooltipTrigger asChild>
										<div
											onClick={(e) => e.stopPropagation()}
											className='flex items-center gap-0.5 text-sm text-gray-500 cursor-default'
										>
											<Icons.unreadMoments className='shrink-0' />
											{flow.unread_count}
										</div>
									</TooltipTrigger>
									<TooltipContent
										side='bottom'
										sideOffset={5}
									>
										<p>
											{`${flow.unread_count} unread ${
												flow.unread_count <= 1 ? "moment" : "moments"
											}`}
										</p>
									</TooltipContent>
								</Tooltip>
							</>
						)}
					</div>
					{flow.members && <MultiAvatarPopover members={flow.members} />}
				</div>
				{flow.type === "personal" ||
				userRole === "owner" ||
				userRole === "member" ? (
					<div className='flex items-center gap-5 justify-between w-full border-t border-gray-300 pt-2'>
						<div className='flex items-center justify-between text-sm cursor-default'>
							<p className='text-xs text-gray-500'>
								Last activity:{" "}
								{flow.last_activity
									? formatDate(flow.last_activity)
									: flow.updated_at
									? formatDate(flow.updated_at)
									: "N/A"}
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
							{userRole === "owner" && (
								<>
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
								</>
							)}
						</div>
					</div>
				) : userRole === "pending" ? (
					<div className='flex flex-col gap-2 w-full border-t border-gray-300 pt-2'>
						<p className='text-xs text-primary text-wrap'>
							You have been invited to join this {flowTypeLabel} flow by{" "}
							<span className='text-muted-foreground'>
								{owner?.username || "the owner"}
							</span>
							.
						</p>
						<div className='grid grid-cols-2 gap-2 items-center justify-between'>
							<Button
								variant={"destructive"}
								size={"sm"}
								onClick={(e) => {
									e.stopPropagation();
									handleDeclineInvite(flow.id);
								}}
							>
								Decline
							</Button>
							<Button
								variant={"primary"}
								size={"sm"}
								onClick={(e) => {
									e.stopPropagation();
									handleAcceptInvite(flow.id);
								}}
							>
								Accept
							</Button>
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
}

export default FlowCard