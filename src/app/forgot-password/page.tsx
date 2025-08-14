// app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setMessage("");
		setError("");
		const res = await fetch("/api/auth/reset-password", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email }),
		});
		const data = await res.json();
		if (res.ok) {
			setMessage("Password reset link sent to your email.");
			setTimeout(() => router.push("/login"), 3000);
		} else {
			setError(data.error || "Something went wrong.");
		}
	};

	return (
		<div className='min-h-screen grid place-items-center p-6 bg-[#F5FAF8]'>
			<div className='w-full max-w-md space-y-6'>
				<h1 className='text-3xl font-bold text-center'>Reset Password</h1>
				<form
					onSubmit={handleSubmit}
					className='space-y-4'
				>
					<div>
						<label
							htmlFor='email'
							className='block text-sm font-medium'
						>
							Email
						</label>
						<input
							id='email'
							type='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className='w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black'
						/>
					</div>
					{message && <p className='text-green-500 text-sm'>{message}</p>}
					{error && <p className='text-red-500 text-sm'>{error}</p>}
					<button
						type='submit'
						className='w-full bg-black text-white px-6 py-3 rounded-full hover:bg-neutral-800'
					>
						Send Reset Link
					</button>
				</form>
			</div>
		</div>
	);
}