"use client";
import React from "react";
import ProfileMenu from "../profile-menu/profile-menu";
import Icons from "../ui/icons";
import { redirect } from "next/navigation";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";

type Props = {};

const HeaderNavbar = ( props: Props ) => {

	return (
		<div className='border-b bg-white flex px-2 md:px-6 py-2 relative items-center justify-between'>
			<div className='flex items-center gap-10'>
				<div
					onClick={() => redirect("/dashboard")}
					className='w-8 h-8 bg-gray-100 object-contain cursor-pointer'
				>
					<Image
						src={"/logo_aira.png"}
						alt='aira_logo'
						height={200}
						width={200}
						className='w-full h-full'
						unoptimized
						priority
					/>
				</div>
			</div>
			<div className="">
				<ProfileMenu />
			</div>
		</div>
	);
};

export default HeaderNavbar;
