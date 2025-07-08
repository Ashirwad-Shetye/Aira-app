// src/app/dashboard/page.tsx
import AuthButtons from "@/components/auth-buttons";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
	try {
		const session = await getServerSession();
		console.log("🧠 DASHBOARD SESSION:", session);

		if (!session || !session.user) {
			console.log("🧠 No session found, redirecting to /signin");
			redirect("/signin");
		}

		return (
			<div className='p-10'>
				<AuthButtons />
				<h1 className='text-xl font-bold'>Welcome, {session.user.email}</h1>
			</div>
		);
	} catch (error) {
		console.error("🧠 Error fetching session:", error);
		redirect("/signin");
	}
}
