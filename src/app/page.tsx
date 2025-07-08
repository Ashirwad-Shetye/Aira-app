// src/app/page.tsx
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function LandingPage() {
	const session = await getServerSession(authOptions);

	if (session?.user) {
		redirect("/dashboard");
	}

	return (
		<main className='min-h-screen flex flex-col justify-center items-center text-center p-6 sm:p-10 bg-white dark:bg-black transition-colors duration-200'>
			<h1 className='text-4xl sm:text-5xl font-bold mb-4 tracking-tight text-black dark:text-white'>
				Welcome to Aira
			</h1>

			<p className='text-gray-600 dark:text-gray-400 max-w-md text-base sm:text-lg mb-8'>
				Minimal. Mindful. Beautiful journaling. Sign in to start your private or
				shared diary.
			</p>

			<div className='flex flex-col sm:flex-row gap-4'>
				<Link
					href='/login'
					className='px-6 py-3 bg-black text-white rounded-full hover:bg-neutral-800 transition'
				>
					Login / Sign Up
				</Link>
				<Link
					href='/about'
					className='px-6 py-3 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-900 transition'
				>
					Learn More
				</Link>
			</div>
		</main>
	);
}