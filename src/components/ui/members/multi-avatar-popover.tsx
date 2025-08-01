import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import { SharedFlowMembers } from "@/types/flows";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../hover-card";
import { getInitialChar } from "@/lib/text-utils";
import { Badge } from "../badge";
import { cn } from "@/lib/utils";

type Props = {
	members: SharedFlowMembers[];
};

const MultiAvatarPopover = ({ members }: Props) => {
	const [isOpen, setIsOpen] = useState(false);

	// Sort members to show owner first
	const sortedMembers = [...members].sort((a, b) =>
		a.role === "owner" ? -1 : b.role === "owner" ? 1 : 0
	);

	return (
		<HoverCard
			open={isOpen}
			onOpenChange={setIsOpen}
		>
			<HoverCardTrigger asChild>
				<div
					onClick={(e) => {
						e.stopPropagation();
						setIsOpen(!isOpen);
					}}
					className='*:data-[slot=avatar]:ring-background flex items-center -space-x-2 *:data-[slot=avatar]:ring-2 cursor-pointer'
				>
					{sortedMembers.map((member, idx) => (
						<Avatar
							key={idx}
							className='rounded-full w-6 h-6'
							slot={member.id}
						>
							<AvatarImage
								src={member.avatar_url ?? ""}
								alt={member.username}
								className={cn(member.role === "pending" && "grayscale")}
							/>
							<AvatarFallback
								className={cn(member.role === "pending" && "grayscale")}
							>
								{getInitialChar(member.username)}
							</AvatarFallback>
						</Avatar>
					))}
				</div>
			</HoverCardTrigger>
			<HoverCardContent className='w-fit flex flex-col gap-2'>
				{sortedMembers.map((member, idx) => (
					<div
						key={idx}
						className={cn(
							"flex items-start gap-3",
							member.role === "pending" && "text-gray-400"
						)}
					>
						<Avatar
							className='rounded-full w-6 h-6'
							slot={member.id}
						>
							<AvatarImage
								src={member.avatar_url ?? ""}
								alt={member.username}
								className={cn(member.role === "pending" && "grayscale")}
							/>
							<AvatarFallback
								className={cn(member.role === "pending" && "grayscale")}
							>
								{getInitialChar(member.username)}
							</AvatarFallback>
						</Avatar>
						<div className='flex flex-col gap-0.5'>
							<p className='text-sm'>{member.username}</p>
							<p
								className={cn(
									"text-muted-foreground text-xs",
									member.role === "pending" && "text-gray-400"
								)}
							>
								{member.email}
							</p>
							<Badge
								variant={
									member.role === "owner"
										? "owner"
										: member.role === "member"
										? "member"
										: "outline"
								}
								className={cn("text-xs")}
							>
								{member.role}
							</Badge>
						</div>
					</div>
				))}
			</HoverCardContent>
		</HoverCard>
	);
};

export default MultiAvatarPopover;
