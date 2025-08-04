import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MomentAuthor } from "@/types/moments";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { getInitialChar } from "@/lib/text-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserById } from "@/lib/queries/user";

type Props = {
	author: MomentAuthor;
};

const AuthorCard = ({ author }: Props) => {
	const [isOpen, setIsOpen] = useState(false);

	const { data, isLoading } = useQuery({
		queryKey: ["user-info", author.user_id],
		queryFn: () => getUserById(author.user_id),
		enabled: isOpen,
		staleTime: 1000 * 60 * 10,
	});

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
					className='*:data-[slot=avatar]:ring-background flex items-center gap-2 *:data-[slot=avatar]:ring-2 cursor-pointer'
				>
					<Avatar
						className='rounded-full w-6 h-6'
						slot={author.user_id}
					>
						<AvatarImage
							src={author.avatar_url ?? ""}
							alt={author.username}
						/>
						<AvatarFallback>{getInitialChar(author.username)}</AvatarFallback>
					</Avatar>
					<h2 className='text-sm'>{author.username}</h2>
				</div>
			</HoverCardTrigger>

			<HoverCardContent
				onClick={(e) => e.stopPropagation()}
				className='w-fit flex flex-col gap-2'
				popover='manual'
			>
				<div className='flex items-start gap-3'>
					<Avatar
						className='rounded-full w-8 h-8 mt-1'
						slot={author.user_id}
					>
						<AvatarImage
							src={author.avatar_url ?? ""}
							alt={author.username}
						/>
						<AvatarFallback>{getInitialChar(author.username)}</AvatarFallback>
					</Avatar>

					<div className='flex flex-col gap-0.5'>
						<p className='text-sm'>{author.username}</p>
						<p className='text-muted-foreground text-xs'>{author.email}</p>

						{isLoading ? (
							<Skeleton className='w-48 h-4 mt-2' />
						) : data?.bio ? (
							<p className='text-xs text-gray-600 mt-2 line-clamp-3 truncate'>{data.bio}</p>
						) : null}
					</div>
				</div>
			</HoverCardContent>
		</HoverCard>
	);
};

export default AuthorCard;
