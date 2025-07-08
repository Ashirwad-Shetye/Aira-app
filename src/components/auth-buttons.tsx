// src/components/auth-buttons.tsx
"use client";

import { signOut, useSession } from "next-auth/react";

export default function AuthButtons() {
	const { data: session, status } = useSession();

	if (status === "loading") {
		return <p>Loading...</p>;
	}

	if (!session) return null;

	return (
		<button
			onClick={() => signOut()}
			className='bg-red-500 text-white px-4 py-2 rounded'
		>
			Logout
		</button>
	);
}