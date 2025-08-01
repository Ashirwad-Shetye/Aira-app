import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../avatar';
import { SharedFlowMembers } from '@/types/flows';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../hover-card';
import { getInitialChar } from '@/lib/text-utils';
import { Badge } from '../badge';

type Props = {
    members: SharedFlowMembers[]
}

const MultiAvatarPopover = ( { members }: Props ) => {
    console.log(members)
  return (
		<HoverCard>
			<HoverCardTrigger asChild>
				<div
					onClick={(e) => e.stopPropagation()}
					className='*:data-[slot=avatar]:ring-background flex items-center -space-x-2 *:data-[slot=avatar]:ring-2'
				>
					{members.map((member, idx) => (
						<Avatar
							key={idx}
							className='rounded-full w-6 h-6'
							slot={member.id}
						>
							<AvatarImage
								src={member.avatar_url ?? ""}
								alt='@shadcn'
							/>
							<AvatarFallback>{getInitialChar(member.username)}</AvatarFallback>
						</Avatar>
					))}
				</div>
			</HoverCardTrigger>
			<HoverCardContent className='w-fit flex flex-col gap-2'>
				{members.map((member, idx) => (
					<div
						key={idx}
						className='flex items-start gap-3'
					>
						<Avatar
							className='rounded-full w-6 h-6'
							slot={member.id}
						>
							<AvatarImage
								src={member.avatar_url ?? ""}
								alt='@shadcn'
							/>
							<AvatarFallback>{getInitialChar(member.username)}</AvatarFallback>
						</Avatar>
						<div className='flex flex-col gap-0.5'>
							<p className='text-sm'>{member.username}</p>
							<p className='text-muted-foreground text-xs'>{member.email}</p>
							<Badge
								variant={"secondary"}
								className='text-xs'
							>
								{member.role}
							</Badge>
						</div>
					</div>
				))}
			</HoverCardContent>
		</HoverCard>
	);
}

export default MultiAvatarPopover