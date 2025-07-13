"use client";

import React from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut, useSession } from "next-auth/react";
import Icons from "../ui/icons";

const ProfileMenu = () => {
	const { data: session, status } = useSession();

	console.log("ProfileMenu session:", { session, status });

	if (status === "loading") {
		return (
			<div className='w-10 h-10 bg-gray-200 select-none text-gray-200 rounded animate-pulse flex items-center justify-center'>
				.
			</div>
		);
	}

	if (status === "unauthenticated") {
		return null;
	}

	const userImage = session?.user?.image ?? ""
	console.log(userImage);
	const userName = session?.user?.name || "NA";
	const initials = userName
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className='outline-none focus:ring-0 cursor-pointer'>
				<Avatar className='w-10 h-10 shrink-0 rounded overflow-hidden outline-none focus:ring-0'>
					<AvatarImage
						src={userImage}
						alt={userName}
						className='rounded overflow-hidden'
					/>
					<AvatarFallback className='w-10 h-10 rounded overflow-hidden'>
						{initials}
					</AvatarFallback>
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
						onClick={() => signOut({ redirect: true, callbackUrl: "/login" })}
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
