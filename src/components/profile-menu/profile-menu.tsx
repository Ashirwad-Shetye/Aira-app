 "use client";

import React from "react";
import Link from "next/link";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut, useSession } from "next-auth/react";
import Icons from "../ui/icons";

const menuItems = [
	{
		label: "Profile",
		href: "/user/profile",
		icon: Icons.user,
	},
	{
		label: "Friends",
		href: "/user/friends",
		icon: Icons.users,
	},
	{
		label: "Settings",
		href: "/user/settings",
		icon: Icons.settings,
	},
	{
		label: "Billing",
		href: "/user/billing",
		icon: Icons.billing,
	},
];

const ProfileMenu = () => {
	const { data: session, status } = useSession();

	if (status === "loading") {
		return (
			<div className='w-8 h-8 bg-gray-200 select-none text-gray-200 rounded animate-pulse flex items-center justify-center'>
				.
			</div>
		);
	}

	if (status === "unauthenticated") return null;

	const userImage = session?.user?.image ?? "";
	const userName = session?.user?.name || "NA";
	const initials = userName
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<div className='outline-none focus:ring-0 cursor-pointer'>
					<Avatar className='w-8 h-8 rounded'>
						<AvatarImage
							src={userImage}
							alt={userName}
						/>
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				side='bottom'
				align='end'
				sideOffset={20}
			>
				{menuItems.map(({ label, href, icon: Icon }) => (
					<Link
						href={href}
						key={label}
						className='cursor-pointer'
					>
						<DropdownMenuItem className='cursor-pointer gap-2'>
							{Icon && <Icon className='w-4 h-4 shrink-0' />}
							{label}
						</DropdownMenuItem>
					</Link>
				))}
				<DropdownMenuItem
					className='cursor-pointer'
					onClick={() => signOut({ redirect: true, callbackUrl: "/login" })}
				>
					<div className='flex items-center gap-2'>
						<Icons.signout className='shrink-0 w-4 h-4' />
						Logout
					</div>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ProfileMenu;
