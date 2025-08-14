//  app/signup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [fullName, setFullName] = useState("");
	const [error, setError] = useState("");
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		const res = await fetch("/api/auth/signup", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password, fullName }),
		});
		const data = await res.json();
		if (res.ok) {
			router.push("/login");
		} else {
			setError(data.error || "Something went wrong.");
		}
	};

	return (
		<div className='min-h-screen grid place-items-center p-6 bg-[#F5FAF8]'>
			<div className='w-full max-w-md space-y-6'>
				<h1 className='text-3xl font-bold text-center'>Sign Up for Aira</h1>
				<form
					onSubmit={handleSubmit}
					className='space-y-4'
				>
					<div>
						<label
							htmlFor='fullName'
							className='block text-sm font-medium'
						>
							Full Name
						</label>
						<input
							id='fullName'
							type='text'
							value={fullName}
							onChange={(e) => setFullName(e.target.value)}
							required
							className='w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black'
						/>
					</div>
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
					<div>
						<label
							htmlFor='password'
							className='block text-sm font-medium'
						>
							Password
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
					{error && <p className='text-red-500 text-sm'>{error}</p>}
					<button
						type='submit'
						className='w-full bg-black text-white px-6 py-3 rounded-full hover:bg-neutral-800'
					>
						Sign Up
					</button>
				</form>
				<p className='text-center text-sm text-gray-600'>
					Already have an account?{" "}
					<Link
						href='/login'
						className='text-black hover:underline'
					>
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
}