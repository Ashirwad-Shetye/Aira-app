// src/app/dashboard/page.tsx
"use client";
import BottomControls from "@/components/bottom-controls/bottom-controls";
import LeftNavbar from "@/components/left-navbar/left-navbar";
import Greetings from "@/components/ui/greetings";
import { useSession } from "next-auth/react";

const DashboardPage = () => {

	const { data: session } = useSession()
	const userFirstname = session?.user.name ? session.user.name.split(" ")[0] : ""

	return (
		<div className='p-5 flex flex-col relative w-full flex-1'>
			<div className='flex gap-10 flex-1'>
				<LeftNavbar />
				<div className='flex flex-col relative w-full'>
					<div className='flex-1 flex flex-col relative'>
						<div>
							<Greetings
								userName={userFirstname}
								align='left'
							/>
						</div>
						<div className='flex flex-1 flex-col relative overflow-hidden'></div>
					</div>
					<BottomControls />
				</div>
			</div>
		</div>
	);
}

export default DashboardPage
