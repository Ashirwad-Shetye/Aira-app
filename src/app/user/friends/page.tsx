// src/app/user/friends/page.tsx
 "use client";

import { useEffect, useRef, useState } from "react";
import BottomControls from "@/components/bottom-controls/bottom-controls";
import ScrollableHeaderLayout from "@/components/layouts/scrollable-header-layout";
import HeaderNavbar from "@/components/header-navbar/header-navbar";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import InviteUserDialog from "@/components/invite-user-dialog/invite-user-dialog";
import Icons from "@/components/ui/icons";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

const FriendsPage = () => {
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const { data: session } = useSession();

	const [friends, setFriends] = useState<any[]>([]);
	const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
	const [sentRequests, setSentRequests] = useState<any[]>([]);
	const [searchInput, setSearchInput] = useState("");
	const [searchStatus, setSearchStatus] = useState<null | {
		type: "success" | "error";
		message: string;
	}>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

	// 📨 Send friend request
	const handleSendRequest = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setSearchStatus(null);

		if (!session?.user?.id) {
			setSearchStatus({ type: "error", message: "You must be logged in." });
			setIsLoading(false);
			return;
		}

		const username = searchInput.trim();

		try {
			// 1. Check if user exists
			const { data: users, error: findError } = await supabase
				.from("users")
				.select("id")
				.eq("username", username);

			if (findError) throw findError;

			if (!users || users.length === 0) {
				setSearchStatus({
					type: "error",
					message: `No user found with username "${username}". You can invite them via email.`,
				});
				setInviteDialogOpen(true);
			} else {
				const toUserId = users[0].id;

				if (toUserId === session.user.id) {
					setSearchStatus({
						type: "error",
						message: "You cannot send a request to yourself.",
					});
					setIsLoading(false);
					return;
				}

				const { data: existing, error: existingError } = await supabase
					.from("friend_requests")
					.select("id")
					.or(
						`and(sender_id.eq.${session.user.id},receiver_id.eq.${toUserId}),and(sender_id.eq.${toUserId},receiver_id.eq.${session.user.id})`
					)
					.eq("status", "pending");

				if (existingError) throw existingError;

				if (existing.length > 0) {
					setSearchStatus({
						type: "error",
						message: "A friend request is already pending.",
					});
					setIsLoading(false);
					return;
				}

				const { error: insertError } = await supabase
					.from("friend_requests")
					.insert({
						sender_id: session.user.id,
						receiver_id: toUserId,
						status: "pending",
					});

				if (insertError) throw insertError;

				setSearchStatus({
					type: "success",
					message: `Friend request sent to "${username}".`,
				});
				setSearchInput("");
			}
		} catch (error: any) {
			setSearchStatus({ type: "error", message: error.message });
		} finally {
			setIsLoading(false);
		}
	};

	// 🔃 Fetch data
	useEffect(() => {
		if (!session?.user?.id) return;

		const fetchFriends = async () => {
			const { data, error } = await supabase
				.from("friends")
				.select("friend:friend_id(id, username)")
				.eq("user_id", session.user.id);

			if (!error) setFriends(data.map((f) => f.friend));
		};

		const fetchIncomingRequests = async () => {
			const { data, error } = await supabase
				.from("friend_requests")
				.select("id, sender:sender_id(id, username, email)")
				.eq("receiver_id", session.user.id)
				.eq("status", "pending");

			if (!error) setIncomingRequests(data ?? []);
		};

		const fetchSentRequests = async () => {
			const { data, error } = await supabase
				.from("friend_requests")
				.select("id, receiver:receiver_id(id, username)")
				.eq("sender_id", session.user.id)
				.eq("status", "pending");

			if (!error) setSentRequests(data ?? []);
		};

		fetchFriends();
		fetchIncomingRequests();
		fetchSentRequests();
	}, [session?.user?.id]);

	// ✅ Accept friend request
	const handleAcceptRequest = async (requestId: string, senderId: string) => {
		if (!session?.user?.id) return;

		const { error: updateError } = await supabase
			.from("friend_requests")
			.update({ status: "accepted" })
			.eq("id", requestId);

		if (updateError) {
			console.error("Error accepting request:", updateError.message);
			return;
		}

		setIncomingRequests((prev) => prev.filter((r) => r.id !== requestId));
	};

	// ❌ Decline friend request
	const handleDeclineRequest = async (requestId: string) => {
		const { error } = await supabase
			.from("friend_requests")
			.update({ status: "declined" })
			.eq("id", requestId);

		if (!error) {
			setIncomingRequests((prev) => prev.filter((r) => r.id !== requestId));
		}
	};

	// 🔥 Unfriend
	const handleUnfriend = async (friendId: string) => {
		if (!session?.user?.id) return;

		const { error } = await supabase
			.from("friends")
			.delete()
			.or(
				`and(user_id.eq.${session.user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${session.user.id})`
			);

		if (!error) {
			setFriends((prev) => prev.filter((f) => f.id !== friendId));
		}
	};

	return (
		<ScrollableHeaderLayout
			header={<HeaderNavbar />}
			scrollContainerRef={scrollContainerRef}
		>
			<div
				ref={scrollContainerRef}
				className='flex-1 flex flex-col gap-10 pb-10 min-h-screen overflow-y-auto p-5'
			>
				<div className='flex flex-col sm:w-full md:w-[80%] max-w-7xl mx-auto min-h-0 px-5'>
					<div className='flex items-center justify-between'>
						<h1 className='font-libre font-semibold text-2xl mb-6'>
							Your Friends
						</h1>

						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant={"primary"}
									onClick={() => setInviteDialogOpen(!inviteDialogOpen)}
									className='flex items-center gap-1'
								>
									<Icons.email className='shrink-0' />
									<p>Invite</p>
								</Button>
							</TooltipTrigger>
							<TooltipContent placement='bottom-end'>
								<p>Invite your friends</p>
							</TooltipContent>
						</Tooltip>
					</div>

					{/* 🔍 Add Friend */}
					<div>
						<h2 className='text-lg font-medium mb-2'>Add a Friend</h2>
						<form
							onSubmit={handleSendRequest}
							className='flex items-center gap-3'
						>
							<input
								type='text'
								placeholder='Enter username'
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
								className='px-3 py-2 text-sm border rounded w-full max-w-sm focus:outline-none focus:ring-1 focus:ring-primary'
							/>
							<Button
								type='submit'
								variant='primary'
								disabled={!searchInput.trim() || isLoading}
							>
								{isLoading ? "Sending..." : "Send Request"}
							</Button>
						</form>
						{searchStatus && (
							<p
								className={`mt-2 text-sm ${
									searchStatus.type === "error"
										? "text-red-500"
										: "text-green-600"
								}`}
							>
								{searchStatus.message}
							</p>
						)}
					</div>

					{/* 📬 Incoming Requests */}
					{incomingRequests.length > 0 && (
						<div className='mt-10'>
							<h2 className='text-lg font-medium mb-2'>
								Pending Friend Requests
							</h2>
							<ul className='space-y-3'>
								{incomingRequests.map((req) => (
									<li
										key={req.id}
										className='flex items-center justify-between border p-3 rounded-md'
									>
										<div>
											<p className='text-sm font-medium'>
												{req.sender.username}
											</p>
											<p className='text-xs text-muted-foreground'>
												{req.sender.email}
											</p>
										</div>
										<div className='flex gap-2'>
											<Button
												variant='primary'
												onClick={() =>
													handleAcceptRequest(req.id, req.sender.id)
												}
											>
												Accept
											</Button>
											<Button
												variant='secondary'
												onClick={() => handleDeclineRequest(req.id)}
											>
												Decline
											</Button>
										</div>
									</li>
								))}
							</ul>
						</div>
					)}

					{/* 🚀 Sent Requests */}
					{sentRequests.length > 0 && (
						<div className='mt-10'>
							<h2 className='text-lg font-medium mb-2'>Sent Friend Requests</h2>
							<ul className='space-y-2'>
								{sentRequests.map((req) => (
									<li
										key={req.id}
										className='flex justify-between items-center border p-3 rounded'
									>
										<p>{req.receiver.username}</p>
										<span className='text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded'>
											Pending
										</span>
									</li>
								))}
							</ul>
						</div>
					)}

					{/* 👥 Friend List */}
					<div className='mt-10'>
						<h2 className='text-lg font-medium mb-2'>Friends</h2>
						{friends.length === 0 ? (
							<p className='text-sm text-muted-foreground'>
								You don’t have any friends yet.
							</p>
						) : (
							<ul className='space-y-2'>
								{friends.map((friend) => (
									<li
										key={friend.id}
										className='flex justify-between items-center border p-3 rounded'
									>
										<p>{friend.username}</p>
										<Button
											variant='destructive'
											size='sm'
											onClick={() => handleUnfriend(friend.id)}
										>
											Remove
										</Button>
									</li>
								))}
							</ul>
						)}
					</div>
				</div>
			</div>
			<InviteUserDialog
				open={inviteDialogOpen}
				onOpenChange={setInviteDialogOpen}
			/>
			<BottomControls />
		</ScrollableHeaderLayout>
	);
};

export default FriendsPage;
