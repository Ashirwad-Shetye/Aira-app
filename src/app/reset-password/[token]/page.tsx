//  app/reset-password/[token]/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const email = searchParams.get("email");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setMessage("");
		setError("");
		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}
		const res = await fetch("/api/auth/reset-password/confirm", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token, email, password }),
		});
		const data = await res.json();
		if (res.ok) {
			setMessage("Password updated successfully.");
			setTimeout(() => router.push("/login"), 3000);
		} else {
			setError(data.error || "Invalid or expired token.");
		}
	};

	return (
		<div className='min-h-screen grid place-items-center p-6 bg-[#F5FAF8]'>
			<div className='w-full max-w-md space-y-6'>
				<h1 className='text-3xl font-bold text-center'>Set New Password</h1>
				<form
					onSubmit={handleSubmit}
					className='space-y-4'
				>
					<div>
						<label
							htmlFor='password'
							className='block text-sm font-medium'
						>
							New Password
						</label>
						<input
							id='password'
							type='password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							className='w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black'
						/>
					</div>
					<div>
						<label
							htmlFor='confirm-password'
							className='block text-sm font-medium'
						>
							Confirm Password
						</label>
						<input
							id='confirm-password'
							type='password'
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
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
						Update Password
					</button>
				</form>
			</div>
		</div>
	);
}