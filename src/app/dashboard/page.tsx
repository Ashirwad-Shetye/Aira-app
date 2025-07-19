// src/app/dashboard/page.tsx
"use client";
import BottomControls from "@/components/bottom-controls/bottom-controls";
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
				className='flex-1 flex flex-col gap-10 pb-10 relative min-h-0 overflow-y-auto p-5'
			>
				<div className='flex-1 flex flex-col w-full min-h-0 relative'>
					<div>
						<Greetings
							userName={userFirstname}
							align='left'
						/>
					</div>
					<div className='flex flex-1 flex-col relative overflow-hidden'></div>
				</div>
			</div>

			<BottomControls />
		</ScrollableHeaderLayout>
	);
}

export default DashboardPage
