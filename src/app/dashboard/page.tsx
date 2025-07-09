// src/app/dashboard/page.tsx
import BottomControls from "@/components/bottom-controls/bottom-controls";
import LeftNavbar from "@/components/left-navbar/left-navbar";
import Greetings from "@/components/ui/greetings";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
	try {
		const session = await getServerSession();
		console.log("🧠 DASHBOARD SESSION:", session);

		if (!session || !session.user) {
			console.log("🧠 No session found, redirecting to /login");
			redirect("/login");
		}

		const userFirstname = session.user.name ? session.user.name.split(" ")[0] : ""

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
	} catch (error) {
		console.error("🧠 Error fetching session:", error);
		redirect("/login");
	}
}
