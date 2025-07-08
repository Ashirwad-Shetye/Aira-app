"use client";

import React from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut, useSession } from "next-auth/react";

type Props = {};

const ProfileMenu = (props: Props) => {
	const { data: session } = useSession();
	return (
		<DropdownMenu>
			<DropdownMenuTrigger className='outline-none focus:ring-0'>
				<Avatar className='w-10 h-10 shrink-0 rounded overflow-hidden outline-none focus:ring-0'>
					<AvatarImage
						src={session?.user.image ?? ""}
						alt='@shadcn'
					/>
					<AvatarFallback>CN</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				side='right'
				align='end'
				sideOffset={20}
			>
				<DropdownMenuItem>Profile</DropdownMenuItem>
				<DropdownMenuItem>Billing</DropdownMenuItem>
				<DropdownMenuItem>Team</DropdownMenuItem>
				<DropdownMenuItem>
					<div onClick={() => signOut()}>
						<h1>Logout</h1>
					</div>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ProfileMenu;
