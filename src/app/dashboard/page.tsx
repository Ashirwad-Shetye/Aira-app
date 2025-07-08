// src/app/dashboard/page.tsx
import AuthButtons from "@/components/auth-buttons";
import LeftNavbar from "@/components/left-navbar/left-navbar";
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

		return (
			<div className='p-5 flex flex-col relative w-full flex-1'>
				<div className='flex gap-10 flex-1'>
					<LeftNavbar />
					<div className='flex-grow'>
						<AuthButtons />
						<h1 className='text-xl font-bold'>Welcome, {session.user.email}</h1>
					</div>
				</div>
			</div>
		);
	} catch (error) {
		console.error("🧠 Error fetching session:", error);
		redirect("/login");
	}
}
