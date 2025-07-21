// src/app/dashboard/page.tsx
"use client";
import BottomControls from "@/components/bottom-controls/bottom-controls";
import AllFlowCard from "@/components/dashboard/all-flows-card";
import HeaderNavbar from "@/components/header-navbar/header-navbar";
import ScrollableHeaderLayout from "@/components/layouts/scrollable-header-layout";
import Greetings from "@/components/ui/greetings";
import { useSession } from "next-auth/react";
import { useRef } from "react";

const DashboardPage = () => {

	const { data: session } = useSession()
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const userFirstname = session?.user.name ? session.user.name.split(" ")[0] : ""

	return (
		<ScrollableHeaderLayout
			header={<HeaderNavbar />}
			scrollContainerRef={scrollContainerRef}
		>
			<div
				ref={scrollContainerRef}
				className='flex-1 flex flex-col gap-10 pb-10 relative min-h-0 overflow-y-auto p-5 bg-[#FBFBFB]'
			>
				<div className='flex-1 flex flex-col w-full min-h-0 gap-5 relative'>
					<div>
						<Greetings
							userName={userFirstname}
							align='left'
						/>
					</div>
					<div className='flex flex-1 flex-col relative overflow-y-auto pb-1'>
						<div className='flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 grid-rows-2 gap-3 xl:overflow-hidden'>
							<div className='border border-gray-300 bg-white rounded-xl h-[20rem] md:h-auto hover:shadow duration-200 col-span-2 relative flex flex-col overflow-hidden'>
								<AllFlowCard />
							</div>
							<div className='border border-gray-300 bg-white rounded-xl hover:shadow duration-200 row-span-2'></div>
							<div className='border border-gray-300 bg-white rounded-xl hover:shadow duration-200'></div>
							<div className='border border-gray-300 bg-white rounded-xl hover:shadow duration-200'></div>
							<div className='border border-gray-300 bg-white rounded-xl hover:shadow duration-200'></div>
							<div className='border border-gray-300 bg-white rounded-xl hover:shadow duration-200'></div>
							<div className='border border-gray-300 bg-white rounded-xl hover:shadow duration-200 col-span-2'></div>
						</div>
					</div>
				</div>
			</div>

			<BottomControls />
		</ScrollableHeaderLayout>
	);
}

export default DashboardPage
