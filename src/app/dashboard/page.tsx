// src/app/dashboard/page.tsx
"use client";
import BottomControls from "@/components/bottom-controls/bottom-controls";
import AllFlowCard from "@/components/dashboard/all-flows-card";
import LatestMomentsCard from "@/components/dashboard/latest-moments-card";
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
				className='flex-1 flex flex-col gap-10 pb-10 relative min-h-0 overflow-y-auto p-5 bg-[#fbfbfb]'
			>
				<div className='flex-1 flex flex-col w-full min-h-0 gap-5 relative overflow-y-auto'>
					<div>
						<Greetings
							userName={userFirstname}
							align='left'
						/>
					</div>
					<div className='flex flex-1 flex-col relative pb-1'>
						<div className='flex-1 grid grid-cols-1 auto-rows-fr sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 grid-rows-2 gap-3 2xl:overflow-hidden'>
							{/* flow card */}
							<div className='border border-gray-300 bg-white rounded-xl sm:h-[20rem] h-[25rem] md:h-auto md:min-h-[15rem] hover:shadow duration-200 col-span-1 md:col-span-2 relative flex flex-col overflow-hidden'>
								<AllFlowCard />
							</div>
							{/* latest moments card */}
							<div className='border border-gray-300 bg-white rounded-xl sm:h-[20rem] h-[25rem] md:h-auto md:min-h-[15rem] hover:shadow duration-200 md:row-span-2 flex flex-col overflow-hidden'>
								<LatestMomentsCard />
							</div>
							<div className='border border-gray-300 bg-white rounded-xl h-[20rem] md:h-auto hover:shadow duration-200 col-span-1'></div>
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
