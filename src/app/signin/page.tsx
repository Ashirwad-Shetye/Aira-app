"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
	return (
		<div className='min-h-screen grid place-items-center'>
			<button
				onClick={() => signIn("google")}
				className='bg-black text-white px-6 py-3 rounded-full'
			>
				Sign in with Google
			</button>
		</div>
	);
}
