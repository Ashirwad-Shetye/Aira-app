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
import Icons from "../ui/icons";

type Props = {};

const ProfileMenu = (props: Props) => {
	const { data: session } = useSession();
	console.log(session)
	return (
		<DropdownMenu>
			<DropdownMenuTrigger className='outline-none focus:ring-0 cursor-pointer'>
				<Avatar className='w-10 h-10 shrink-0 rounded overflow-hidden outline-none focus:ring-0'>
					<AvatarImage
						src={session?.user.image ?? ""}
						alt='@shadcn'
						className='border-2'
					/>
					<AvatarFallback className='w-10 h-10 border-2'>CN</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				side='right'
				align='end'
				sideOffset={20}
			>
				<DropdownMenuItem className='cursor-pointer'>Profile</DropdownMenuItem>
				<DropdownMenuItem className='cursor-pointer'>Billing</DropdownMenuItem>
				<DropdownMenuItem className='cursor-pointer'>
					<div
						className='flex items-center gap-1'
						onClick={() => signOut()}
					>
						<Icons.signout className='shrink-0' />
						<h1>Logout</h1>
					</div>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ProfileMenu;
