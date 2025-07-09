// src/app/diaries/page.tsx
import BottomControls from "@/components/bottom-controls/bottom-controls";
import LeftNavbar from "@/components/left-navbar/left-navbar";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Diaries() {
	try {
		const session = await getServerSession();

		if (!session || !session.user) {
			console.log("🧠 No session found, redirecting to /login");
			redirect("/login");
		}

		return (
			<div className='p-5 flex flex-col relative w-full flex-1'>
				<div className='flex gap-10 flex-1'>
					<LeftNavbar />
					<div className='flex flex-col relative w-full'>
						<div className='flex-1 flex flex-col relative'>
              <h1 className='text-2xl font-bold'>Your Diaries</h1>
              <div className="flex flex-1 flex-col relative overflow-hidden"></div>
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