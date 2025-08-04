"use client";

import { useEffect, useRef, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

import BottomControls from "@/components/bottom-controls/bottom-controls";
import ScrollableHeaderLayout from "@/components/layouts/scrollable-header-layout";
import HeaderNavbar from "@/components/header-navbar/header-navbar";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Icons from "@/components/ui/icons";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

const ProfilePage = () => {
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const { data: session } = useSession();

	const [fullName, setFullName] = useState("");
	const [username, setUsername] = useState("");
	const [bio, setBio] = useState("");
	const [status, setStatus] = useState("");
	const [avatarUrl, setAvatarUrl] = useState("");
	const [profileData, setProfileData] = useState({
		full_name: "",
		username: "",
		bio: "",
		status: "",
	});

	const [connectedAccounts, setConnectedAccounts] = useState({
		google: false,
		apple: false,
	});

	const [isSaving, setIsSaving] = useState(false);
	const [isEditingDetails, setIsEditingDetails] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchProfile = async () => {
			if (!session?.user?.id) return;

			setIsLoading(true);

			const { data, error } = await supabase
				.from("users")
				.select(
					"full_name, username, bio, status, avatar_url, google_id, apple_id"
				)
				.eq("id", session.user.id)
				.single();

			setIsLoading(false);

			if (error) {
				console.error("Error fetching profile:", error.message);
				toast.error("Failed to load profile");
				return;
			}

			setFullName(data.full_name || "");
			setUsername(data.username || "");
			setBio(data.bio || "");
			setStatus(data.status || "");
			setAvatarUrl(data.avatar_url || "");
			setConnectedAccounts({
				google: !!data.google_id,
				apple: !!data.apple_id,
			});
			setProfileData({
				full_name: data.full_name || "",
				username: data.username || "",
				bio: data.bio || "",
				status: data.status || "",
			});
		};

		fetchProfile();
	}, [session?.user?.id]);

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!session?.user?.id) return;
		setIsSaving(true);

		const { error } = await supabase
			.from("users")
			.update({
				full_name: fullName,
				username,
				bio,
				status,
			})
			.eq("id", session.user.id);

		setIsSaving(false);

		if (error) {
			console.error("Update failed:", error.message);
			toast.error("Failed to update profile.");
		} else {
			toast.success("Profile updated successfully.");
			setIsEditingDetails(false);
			setProfileData({ full_name: fullName, username, bio, status });
		}
	};

	const handleCancel = () => {
		setFullName(profileData.full_name);
		setUsername(profileData.username);
		setBio(profileData.bio);
		setStatus(profileData.status);
		setIsEditingDetails(false);
	};

	return (
		<ScrollableHeaderLayout
			header={<HeaderNavbar />}
			scrollContainerRef={scrollContainerRef}
		>
			<div
				ref={scrollContainerRef}
				className='flex-1 flex flex-col gap-10 pb-10 px-5 overflow-y-auto'
			>
				<div className='flex flex-col w-full sm:w-full md:w-[80%] max-w-7xl mx-auto'>
					<h1 className='font-libre text-2xl font-semibold my-8'>
						Your Profile
					</h1>

					{/* AVATAR */}
					<div className='flex flex-col gap-3 mb-10'>
						<div className='flex items-center justify-between'>
							<h1 className='text-lg font-semibold text-primary'>Avatar</h1>
							{!isLoading && (
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant='primary'
											size='sm'
											className='flex items-center gap-2'
										>
											<Icons.edit className='shrink-0' />
											<p>Edit</p>
										</Button>
									</TooltipTrigger>
									<TooltipContent placement='bottom-end'>
										<p>Change Avatar</p>
									</TooltipContent>
								</Tooltip>
							)}
						</div>

						{isLoading ? (
							<Skeleton className='sm:w-20 sm:h-20 md:w-40 md:h-40 w-40 h-40 rounded' />
						) : avatarUrl ? (
							<Image
								src={avatarUrl}
								alt='user_avatar'
								loading='lazy'
								height={500}
								width={500}
								unoptimized
								className='sm:w-20 sm:h-20 md:w-40 md:h-40 w-40 h-40 rounded object-cover'
							/>
						) : (
							<div className='sm:w-20 sm:h-20 md:w-40 md:h-40 w-40 h-40 flex items-center justify-center text-4xl font-semibold text-muted-foreground bg-muted rounded'>
								<p>{fullName.charAt(0)}</p>
							</div>
						)}
					</div>

					{/* DETAILS */}
					<div className='flex flex-col gap-3 mb-10'>
						<div className='flex items-center justify-between'>
							<h1 className='text-lg text-primary font-semibold'>Details</h1>
							{!isEditingDetails && !isLoading && (
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant='primary'
											size='sm'
											className='flex items-center gap-2'
											onClick={() => setIsEditingDetails(true)}
										>
											<Icons.edit className='shrink-0' />
											<p>Edit</p>
										</Button>
									</TooltipTrigger>
									<TooltipContent placement='bottom-end'>
										<p>Edit details</p>
									</TooltipContent>
								</Tooltip>
							)}
						</div>

						{/* LOADING STATE */}
						{isLoading ? (
							<div className='flex flex-col gap-6 text-sm'>
								<div className='flex flex-col gap-2'>
									<h2 className='text-muted-foreground text-xs'>Username</h2>
									<Skeleton className='h-8 w-[60%]' />
								</div>
								<div className='flex flex-col gap-2'>
									<h2 className='text-muted-foreground text-xs'>Full Name</h2>
									<Skeleton className='h-8 w-[80%]' />
								</div>
								<div className='flex flex-col gap-2'>
									<h2 className='text-muted-foreground text-xs'>Bio</h2>
									<Skeleton className='h-8 w-full' />
								</div>
								<div className='flex flex-col gap-2'>
									<h2 className='text-muted-foreground text-xs'>Status</h2>
									<Skeleton className='h-8 w-[50%]' />
								</div>
							</div>
						) : !isEditingDetails ? (
							// READ-ONLY VIEW
							<div className='flex flex-col gap-6 text-sm'>
								<div className='flex flex-col gap-2'>
									<h2 className='text-muted-foreground text-xs'>Username</h2>
									<p>{username}</p>
								</div>
								<div className='flex flex-col gap-2'>
									<h2 className='text-muted-foreground text-xs'>Full Name</h2>
									<p>{fullName || "Add your full name"}</p>
								</div>
								<div className='flex flex-col gap-2'>
									<h2 className='text-muted-foreground text-xs'>Bio</h2>
									<p className={bio ? "" : "text-muted-foreground"}>
										{bio || "Add a short bio about yourself..."}
									</p>
								</div>
								<div className='flex flex-col gap-2'>
									<h2 className='text-muted-foreground text-xs'>Status</h2>
									<p className={status ? "" : "text-muted-foreground"}>
										{status || "Add your status e.g. Feeling good ✨"}
									</p>
								</div>
							</div>
						) : (
							// EDIT FORM
							<form
								onSubmit={handleSave}
								className='flex flex-col gap-6 text-sm'
							>
								<div className='flex flex-col gap-2'>
									<label
										htmlFor='username'
										className='text-xs'
									>
										Username
									</label>
									<input
										id='username'
										type='text'
										value={username}
										onChange={(e) => setUsername(e.target.value)}
										placeholder='Unique username'
										className='px-3 py-2 border rounded w-full focus:outline-none focus:ring-1 focus:ring-primary'
									/>
								</div>

								<div className='flex flex-col gap-2'>
									<label
										htmlFor='name'
										className='text-xs'
									>
										Full Name
									</label>
									<input
										id='name'
										type='text'
										value={fullName}
										onChange={(e) => setFullName(e.target.value)}
										placeholder='Your full name'
										className='px-3 py-2 border rounded w-full focus:outline-none focus:ring-1 focus:ring-primary'
									/>
								</div>

								<div className='flex flex-col gap-2'>
									<label
										htmlFor='bio'
										className='text-xs'
									>
										Bio
									</label>
									<textarea
										id='bio'
										rows={3}
										value={bio}
										onChange={(e) => setBio(e.target.value)}
										placeholder='A short bio about yourself'
										className='px-3 py-2 border rounded w-full focus:outline-none focus:ring-1 focus:ring-primary'
									/>
								</div>

								<div className='flex flex-col gap-2'>
									<label
										htmlFor='status'
										className='text-xs'
									>
										Status
									</label>
									<input
										id='status'
										type='text'
										value={status}
										onChange={(e) => setStatus(e.target.value)}
										placeholder='e.g. Feeling good ✨'
										className='px-3 py-2 border rounded w-full focus:outline-none focus:ring-1 focus:ring-primary'
									/>
								</div>

								<div className='flex gap-4'>
									<Button
										type='submit'
										variant='primary'
										disabled={isSaving}
									>
										{isSaving ? "Saving..." : "Save Changes"}
									</Button>
									<Button
										type='button'
										variant='ghost'
										onClick={handleCancel}
									>
										Cancel
									</Button>
								</div>
							</form>
						)}
					</div>
					<div className='flex flex-col gap-6 mb-10'>
						<h1 className='text-lg text-primary font-semibold'>
							Connected Accounts
						</h1>
						<div className='flex flex-col gap-5 text-sm'>
							{/* Google */}
							<div className='flex items-center justify-between'>
								<div className='flex gap-2 items-center'>
									<Icons.googleColored className='w-5 h-5 text-muted-foreground' />
									<span>Google</span>
								</div>
								{isLoading ? (
									<Skeleton className='w-20 h-8' />
								) : (
									<>
										{connectedAccounts.google ? (
											<span className='text-green-600 text-xs font-medium'>
												Connected
											</span>
										) : (
											<Button
												variant='outline'
												size='sm'
												onClick={() => signIn("google")}
											>
												Connect
											</Button>
										)}
									</>
								)}
							</div>

							{/* Apple */}
							<div className='flex items-center justify-between'>
								<div className='flex gap-2 items-center'>
									<Icons.apple className='w-5 h-5 text-muted-foreground' />
									<span>Apple</span>
								</div>
								{isLoading ? (
									<Skeleton className='w-20 h-8' />
								) : (
									<>
										{connectedAccounts.apple ? (
											<span className='text-green-600 text-xs font-medium'>
												Connected
											</span>
										) : (
											<Button
												variant='outline'
												size='sm'
												onClick={() => signIn("apple")}
											>
												Connect
											</Button>
										)}
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
			<BottomControls
				status={isEditingDetails}
				isSaving={isSaving}
			/>
		</ScrollableHeaderLayout>
	);
};

export default ProfilePage;