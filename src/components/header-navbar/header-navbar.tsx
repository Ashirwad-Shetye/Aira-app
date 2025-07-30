 "use client";
import React from "react";
import ProfileMenu from "../profile-menu/profile-menu";
import { redirect, useRouter } from "next/navigation";
import Image from "next/image";

type Props = {};

const HeaderNavbar = ( props: Props ) => {
	const router = useRouter()

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
			<div className='flex items-center gap-5 md:gap-10 lg:gap-20'>
				<div className='flex items-center gap-5 text-sm text-muted-foreground'>
					<button
						type='button'
						onClick={() => router.push("/dashboard")}
						className='hover:text-black cursor-pointer px-3 py-1 duration-200'
					>
						Dashboard
					</button>
					<button
						type='button'
						onClick={() => router.push("/flows")}
						className='hover:text-black cursor-pointer px-3 py-1 duration-200'
					>
						Flows
					</button>
				</div>
				<ProfileMenu />
			</div>
		</div>
	);
};

export default HeaderNavbar;
