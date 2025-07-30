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
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/custom-alert-dialog/confirm-dialog";

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
	const [ isFetching, setIsFetching ] = useState( true );
	const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
	const [friendToRemove, setFriendToRemove] = useState<null | {
		id: string;
		username: string;
	}>(null);

	const refreshData = async () => {
		if (!session?.user?.id) return;
		setIsFetching(true);

		const fetchFriends = supabase
			.from("friends")
			.select("friend:friend_id(id, username, email, avatar_url)")
			.eq("user_id", session.user.id);

		const fetchIncomingRequests = supabase
			.from("friend_requests")
			.select("id, sender:sender_id(id, username, email)")
			.eq("receiver_id", session.user.id)
			.eq("status", "pending");

		const fetchSentRequests = supabase
			.from("friend_requests")
			.select("id, receiver:receiver_id(id, username)")
			.eq("sender_id", session.user.id)
			.eq("status", "pending");

		const [friendsRes, incomingRes, sentRes] = await Promise.all([
			fetchFriends,
			fetchIncomingRequests,
			fetchSentRequests,
		]);

		if (!friendsRes.error) setFriends(friendsRes.data.map((f) => f.friend));
		if (!incomingRes.error) setIncomingRequests(incomingRes.data ?? []);
		if (!sentRes.error) setSentRequests(sentRes.data ?? []);

		setIsFetching(false);
	};

	useEffect(() => {
		refreshData();
	}, [session?.user?.id]);

	const handleSendRequest = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setSearchStatus(null);

		if (!session?.user?.id) {
			setSearchStatus({ type: "error", message: "Please log in to continue." });
			setIsLoading(false);
			return;
		}

		const username = searchInput.trim();

		try {
			const { data: users, error: findError } = await supabase
				.from("users")
				.select("id")
				.eq("username", username);

			if (findError) throw findError;
			if (!users || users.length === 0) {
				setSearchStatus({
					type: "error",
					message: `No user found with username "${username}". Invite them via email to join!`,
				});
				setInviteDialogOpen(true);
			} else {
				const toUserId = users[0].id;

				if (toUserId === session.user.id) {
					setSearchStatus({
						type: "error",
						message: "You cannot send a friend request to yourself.",
					});
					setIsLoading(false);
					return;
				}

				if (friends.find((f) => f.id === toUserId)) {
					setSearchStatus({
						type: "error",
						message: `${username} is already in your friends list.`,
					});
					setIsLoading(false);
					return;
				}

				if (sentRequests.find((r) => r.receiver.id === toUserId)) {
					setSearchStatus({
						type: "error",
						message: `Friend request to ${username} is already pending.`,
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
					message: `Friend request successfully sent to ${username}!`,
				});
				setSearchInput("");
				refreshData();
			}
		} catch (error: any) {
			setSearchStatus({ type: "error", message: error.message });
		} finally {
			setIsLoading(false);
		}
	};

	const handleAcceptRequest = async (requestId: string, senderId: string) => {
		if (!session?.user?.id) return;

		const { error } = await supabase
			.from("friend_requests")
			.update({ status: "accepted" })
			.eq("id", requestId);

		if (!error) refreshData();
	};

	const handleDeclineRequest = async (requestId: string) => {
		const { error } = await supabase
			.from("friend_requests")
			.update({ status: "declined" })
			.eq("id", requestId);

		if (!error) refreshData();
	};

	const handleUnfriend = async (friendId: string) => {
		if (!session?.user?.id) return;

		const { error } = await supabase
			.from("friends")
			.delete()
			.or(
				`and(user_id.eq.${session.user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${session.user.id})`
			);

		if (!error) refreshData();
	};

	const FriendSkeleton = () => (
		<div className='flex justify-between items-center border p-3 rounded'>
			<Skeleton className='h-6 w-32' />
			<Skeleton className='h-8 w-20' />
		</div>
	);

	const RequestSkeleton = () => (
		<div className='flex items-center justify-between border p-3 rounded-md'>
			<div className='space-y-2'>
				<Skeleton className='h-5 w-28' />
				<Skeleton className='h-4 w-40' />
			</div>
			<div className='flex gap-2'>
				<Skeleton className='h-8 w-20' />
				<Skeleton className='h-8 w-20' />
			</div>
		</div>
	);

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
									variant='primary'
									onClick={() => setInviteDialogOpen(!inviteDialogOpen)}
									className='flex items-center gap-1 text-sm'
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
						<h2 className='text-lg font-medium mb-2 text-primary'>
							Add a Friend
						</h2>
						<form
							onSubmit={handleSendRequest}
							className='flex items-center gap-3 text-sm'
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
								className='text-sm'
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

					{/* 👥 Friend List */}
					<div className='mt-10'>
						<h2 className='text-lg font-medium mb-2 text-primary'>Friends</h2>
						{isFetching ? (
							<div className='space-y-2'>
								<FriendSkeleton />
								<FriendSkeleton />
								<FriendSkeleton />
							</div>
						) : friends.length === 0 ? (
							<Card className='bg-muted'>
								<CardContent className='flex flex-col items-center justify-center h-32 text-muted-foreground p-6'>
									<Icons.users className='h-8 w-8 mb-2 text-muted-foreground/50' />
									<p className='text-center'>
										Your friend list is empty. Start connecting by sending
										friend requests or inviting friends to join!
									</p>
								</CardContent>
							</Card>
						) : (
							<ul className='space-y-2'>
								{friends.map((friend) => (
									<li
										key={friend.id}
										className='flex justify-between items-center border p-3 rounded'
									>
										<div className='flex items-center gap-3'>
											{friend.avatar_url ? (
												<img
													src={friend.avatar_url}
													alt='avatar'
													className='w-8 h-8 rounded-full object-cover'
												/>
											) : (
												<div className='w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground font-medium'>
													{friend.username?.charAt(0).toUpperCase()}
												</div>
											)}
											<div className='flex flex-col'>
												<span className='text-sm font-medium'>
													{friend.username}
												</span>
												<span className='text-xs text-muted-foreground'>
													{friend.email}
												</span>
											</div>
										</div>
										<Button
											variant='destructive'
											size='sm'
											onClick={() => {
												setFriendToRemove({
													id: friend.id,
													username: friend.username,
												});
												setConfirmDialogOpen(true);
											}}
										>
											Remove
										</Button>
									</li>
								))}
							</ul>
						)}
					</div>

					{/* 📬 Incoming Requests */}
					<div className='mt-10'>
						<h2 className='text-lg font-medium mb-2 text-primary'>
							Pending Friend Requests
						</h2>
						{isFetching ? (
							<div className='space-y-3'>
								<RequestSkeleton />
								<RequestSkeleton />
							</div>
						) : incomingRequests.length > 0 ? (
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
						) : (
							<Card className='bg-muted'>
								<CardContent className='flex flex-col items-center justify-center h-32 text-muted-foreground p-6'>
									<Icons.email className='h-8 w-8 mb-2 text-muted-foreground/50' />
									<p className='text-center'>
										No pending friend requests. Check back later or invite new
										friends!
									</p>
								</CardContent>
							</Card>
						)}
					</div>

					{/* 🚀 Sent Requests */}
					<div className='mt-10'>
						<h2 className='text-lg font-medium mb-2 text-primary'>
							Sent Friend Requests
						</h2>
						{isFetching ? (
							<div className='space-y-2'>
								<FriendSkeleton />
								<FriendSkeleton />
							</div>
						) : sentRequests.length > 0 ? (
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
						) : (
							<Card className='bg-muted'>
								<CardContent className='flex flex-col items-center justify-center h-32 text-muted-foreground p-6'>
									<Icons.send className='h-8 w-8 mb-2 text-muted-foreground/50' />
									<p className='text-center'>
										No pending sent requests. Try sending a new friend request!
									</p>
								</CardContent>
							</Card>
						)}
					</div>
				</div>
			</div>
			<ConfirmDialog
				open={confirmDialogOpen}
				onOpenChange={setConfirmDialogOpen}
				title={`Remove ${friendToRemove?.username}?`}
				description='This will permanently remove them from your friends list.'
				cancelText='Cancel'
				confirmText='Remove'
				onConfirm={() => {
					if (friendToRemove) {
						handleUnfriend(friendToRemove.id);
						setConfirmDialogOpen(false);
					}
				}}
			/>
			<InviteUserDialog
				open={inviteDialogOpen}
				onOpenChange={setInviteDialogOpen}
			/>
			<BottomControls />
		</ScrollableHeaderLayout>
	);
};

export default FriendsPage;
