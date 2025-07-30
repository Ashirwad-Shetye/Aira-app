 "use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "next-auth/react";

export default function InviteUserDialog({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const { data: session } = useSession();
	const [email, setEmail] = useState("");
	const [status, setStatus] = useState<null | {
		type: "success" | "error" | "invalid";
		message: string;
	}>(null);
	const [loading, setLoading] = useState(false);

	// Email validation regex
	const isValidEmail = (email: string): boolean => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const handleSendInvite = async () => {
		// Check if email is valid before sending
		if (!isValidEmail(email)) {
			setStatus({
				type: "invalid",
				message: "Please enter a valid email address",
			});
			return;
		}

		setLoading(true);
		setStatus(null);

		try {
			const userId = session?.user?.id;

			const { error } = await supabase.from("invites").insert({
				email,
				invited_by: userId,
			});

			if (error) throw error;

			setStatus({ type: "success", message: `Invitation sent to ${email}` });
			setEmail("");
		} catch (err: any) {
			setStatus({
				type: "error",
				message: err.message || "Error sending invite",
			});
		} finally {
			setLoading(false);
		}
	};

	// Real-time email validation
	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newEmail = e.target.value;
		setEmail(newEmail);

		if (newEmail && !isValidEmail(newEmail)) {
			setStatus({
				type: "invalid",
				message: "Please enter a valid email address",
			});
		} else {
			setStatus(null);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className='sm:max-w-md'>
				<DialogHeader>
					<DialogTitle>Invite a Friend</DialogTitle>
				</DialogHeader>
				<div className='flex flex-col gap-4'>
					<div className='relative'>
						<input
							type='email'
							placeholder='Enter email address'
							value={email}
							onChange={handleEmailChange}
							disabled={loading}
							className={`px-3 py-2 text-sm border rounded w-full focus:outline-none focus:ring-1 focus:ring-primary ${
								status?.type === "invalid" ? "border-red-500" : ""
							}`}
						/>
						{status?.type === "invalid" && (
							<p className='text-sm text-red-500 mt-1'>{status.message}</p>
						)}
					</div>
					<Button
						onClick={handleSendInvite}
						disabled={!email || loading || status?.type === "invalid"}
					>
						{loading ? "Sending..." : "Send Invite"}
					</Button>
					{status && status.type !== "invalid" && (
						<p
							className={`text-sm ${
								status.type === "error" ? "text-red-500" : "text-green-600"
							}`}
						>
							{status.message}
						</p>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
