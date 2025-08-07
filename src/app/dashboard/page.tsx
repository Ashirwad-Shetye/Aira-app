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
				<div className='flex flex-col sm:w-full md:w-[80%] max-w-7xl mx-auto min-h-0 px-5'>
					<Greetings
						userName={userFirstname}
						align='left'
					/>
					<div className='grid grid-cols-4 py-10'>
						<div>
							
						</div>
					</div>
				</div>
			</div>

			<BottomControls />
		</ScrollableHeaderLayout>
	);
}

export default DashboardPage
