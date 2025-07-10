"use client";
import React from "react";
import ProfileMenu from "../profile-menu/profile-menu";
import Icons from "../ui/icons";
import { redirect } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Image from "next/image";

type Props = {};

const LeftNavbar = ( props: Props ) => {
    
    const navbarVals: {
			key: string;
			label: string;
			icon: React.JSX.Element;
			callback: () => void;
		}[] = [
			{
				key: "home",
				label: "Home",
				icon: <Icons.home />,
                callback: () => {
                    redirect("/dashboard");
                },
			},
			{
				key: "search",
				label: "Search",
				icon: <Icons.search />,
                callback: () => {
                    redirect("/search");
                },
			},
			{
				key: "flows",
				label: "Flows",
				icon: <Icons.notebook />,
                callback: () => {
                    redirect("/flows");
                },
			},
        ];
    
	return (
		<div className='border bg-white rounded-lg flex p-2 pb-0 shadow flex-col relative items-center justify-between'>
			<div className='flex flex-col gap-10'>
				<div
					onClick={() => redirect("/dashboard")}
					className='w-10 h-10 bg-gray-100 object-contain cursor-pointer'
				>
					<Image
						src={"/logo_aira.png"}
						alt='aira_logo'
						height={200}
						width={200}
						className='w-full h-full'
						unoptimized
					/>
				</div>
				<div className='flex flex-col items-center justify-between gap-3'>
					{navbarVals.map((navbarVal, idx) => (
						<Tooltip key={`${navbarVal}_${idx}`}>
							<TooltipTrigger asChild>
								<button
									type='button'
									key={navbarVal.key}
									onClick={navbarVal.callback}
									className='shrink-0 cursor-pointer w-10 h-10 rounded-md flex items-center justify-center text-xl hover:bg-gray-100 text-gray-800 active:scale-95 duration-150 transition-all'
								>
									{navbarVal.icon}
								</button>
							</TooltipTrigger>
							<TooltipContent
								side='right'
								sideOffset={10}
							>
								<p>{navbarVal.label}</p>
							</TooltipContent>
						</Tooltip>
					))}
				</div>
			</div>
			<div>
				<div>
					<ProfileMenu />
				</div>
			</div>
		</div>
	);
};

export default LeftNavbar;
