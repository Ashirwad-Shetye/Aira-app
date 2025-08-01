"use client";

import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import Icons from "../ui/icons";
import { Button } from "../ui/button";
import { useState, useTransition, useEffect, ReactElement } from "react";
import { createFlow } from "@/lib/data/create-flow";
import { Flow } from "@/types/flows";
import TagInput from "../tag-input/tag-input";
import MemberInput, {
	FriendSuggestion,
	MemberEntry,
} from "../member-input/member-input";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "next-auth/react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export interface NewFlowDialogProps {
	flow?: Flow;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	onSave?: (data: {
		id?: string;
		title: string;
		bio?: string;
		tags?: string[];
		memberIds?: {
			id: string;
			email: string;
		}[];
		inviteEmails?: string[];
		type?: "personal" | "shared" | "couple";
	}) => void;
	children?: ReactElement;
	clearOnClose?: boolean;
}

export function NewFlowDialog(props: NewFlowDialogProps = {}) {
	const {
		flow,
		open,
		onOpenChange,
		onSave,
		children,
		clearOnClose = true,
	} = props;

	const [title, setTitle] = useState<string>(flow?.title || "Untitled Flow");
	const [bio, setBio] = useState<string>(flow?.bio || "");
	const [tags, setTags] = useState<string[]>(flow?.tags ?? []);
	const [members, setMembers] = useState<MemberEntry[]>([]);
	const [flowType, setFlowType] = useState<"personal" | "shared" | "couple">(
		flow?.type ?? "personal"
	);
	const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
	const [friendSuggestions, setFriendSuggestions] = useState<
		FriendSuggestion[]
	>([]);
	const [isPending, startTransition] = useTransition();
	const { data: session } = useSession();
	
	const isEdit = !!flow;

	useEffect(() => {
		if ( flow ) {
			const preSelectedMembers: MemberEntry[] = flow?.members
				? flow.members
						.filter((member) => member.role !== "owner")
						.map((member) => ({ id: member.id, email: member.email }))
				: [];
			setTitle(flow.title || "Untitled Flow");
			setBio(flow.bio || "");
			setTags(flow.tags ?? []);
			setMembers(preSelectedMembers)
			setFlowType(flow.type ?? "personal");
		} else {
			// If creating new
			setTitle("Untitled Flow");
			setBio("");
			setTags([]);
			setMembers([]);
			setFlowType("personal");
		}
	}, [flow]);

	useEffect(() => {
		const fetchSuggestedTags = async () => {
			if (!session?.user?.id) return;
			const { data, error } = await supabase.rpc("get_user_flow_tags", {
				user_id_input: session.user.id,
			});
			if (!error && data) setSuggestedTags(data);
		};
		fetchSuggestedTags();
	}, [session]);

	useEffect(() => {
		const fetchFriends = async () => {
			if (!session?.user?.id || flowType === "personal") return;

			const { data, error } = await supabase
				.from("friends")
				.select("friend:friend_id(username, email, avatar_url, id)")
				.eq("user_id", session.user.id);

			if (error || !data) return;

			const formatted: FriendSuggestion[] = data.map((f: any) => ({
				username: f.friend.username,
				email: f.friend.email,
				avatar_url: f.friend.avatar_url || undefined,
				user_id: f.friend.id,
			}));

			setFriendSuggestions(formatted);
		};

		fetchFriends();
	}, [session?.user?.id, flowType]);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!title.trim()) return;

		const memberIds: {
			id: string;
			email: string;
		}[] = [];
		const inviteEmails: string[] = [];

		members.forEach((email) => {
			const match = friendSuggestions.find((s) => s.email === email.email);
			if (match?.user_id) {
				memberIds.push({
					id: match.user_id,
					email: match.email,
				});
			} else {
				inviteEmails.push(email.email);
			}
		});

		const payload = {
			id: flow?.id,
			title: title.trim(),
			bio: bio.trim(),
			tags,
			memberIds: flowType !== "personal" ? memberIds : [],
			inviteEmails: flowType !== "personal" ? inviteEmails : [],
			type: flowType,
		};

		startTransition(() => {
			if (onSave) {
				onSave(payload);
			} else {
				createFlow(payload);
			}
		});
	};

	const handleOnClose = () => {
		if (clearOnClose) {
			setBio("");
			setTitle("Untitled Flow");
			setTags([]);
			setMembers([]);
			setFlowType("personal");
		}
		if (onOpenChange) onOpenChange(false);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent
				className='w-[50rem] max-w-[90%] max-h-[80%] overflow-y-auto'
				role='dialog'
			>
				<DialogTitle>
					<Icons.flow />
					<p>{flow ? "Edit flow" : "Create new flow"}</p>
				</DialogTitle>
				<DialogHeader>
					<DialogDescription className='text-xs'>
						Flows hold your thoughts over time. Set one up and begin writing
						your Moments.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit}>
					<div className='grid gap-4 my-3'>
						{/* Flow Type */}
						<div className='grid gap-2'>
							<label className='text-sm'>Flow Type</label>
							<p className='text-xs text-muted-foreground'>
								Choose how you want to use this flow — for yourself, with
								someone close, or as a group.
							</p>

							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<div>
											<ToggleGroup
												type='single'
												value={flowType}
												onValueChange={(val: string) => {
													if (!isEdit)
														setFlowType((val as typeof flowType) ?? "personal");
												}}
												className='w-full'
											>
												<ToggleGroupItem
													value='personal'
													className='border'
												>
													Personal
												</ToggleGroupItem>
												<ToggleGroupItem
													value='shared'
													className='border-t border-b'
												>
													Shared
												</ToggleGroupItem>
												<ToggleGroupItem
													value='couple'
													className='border'
												>
													Couple
												</ToggleGroupItem>
											</ToggleGroup>
										</div>
									</TooltipTrigger>
									{isEdit && (
										<TooltipContent side='top'>
											Cannot change flow type once created.
										</TooltipContent>
									)}
								</Tooltip>
							</TooltipProvider>

							<p className='text-xs text-primary'>
								{flowType === "personal" &&
									"This flow is private — only you can view and write in it."}
								{flowType === "shared" &&
									"Invite up to 4 others to contribute. Everyone can write, read, and reflect together."}
								{flowType === "couple" &&
									"Just for you and your partner — a shared space to connect and express privately."}
							</p>
						</div>

						{/* Title */}
						<div className='grid gap-2'>
							<label
								htmlFor='flow-name-1'
								className='text-sm'
							>
								Flow Title
							</label>
							<p className='text-xs text-muted-foreground'>
								This is the name of your Flow — think of it like a personal
								journal.
							</p>
							<input
								id='flow-name-1'
								value={title}
								onChange={(e) => setTitle(e.currentTarget.value)}
								maxLength={100}
								className='px-3 py-1 text-sm border rounded focus:ring-0 outline-none'
								placeholder='e.g. Morning Reflections, Letters to Myself'
							/>
							<p className='text-xs text-right text-gray-600'>
								({title.length} / 100)
							</p>
						</div>

						{/* Bio */}
						<div className='grid gap-2'>
							<label className='text-sm'>About this Flow (optional)</label>
							<p className='text-xs text-muted-foreground'>
								Add a short description about this flow.
							</p>
							<textarea
								value={bio}
								onChange={(e) => setBio(e.currentTarget.value)}
								maxLength={300}
								className='px-3 py-1 h-20 text-sm border rounded focus:ring-0 outline-none'
								placeholder='e.g. A space to write honestly each morning'
							/>
							<p className='text-xs text-right text-gray-600'>
								({bio.length} / 300)
							</p>
						</div>

						{/* Tags */}
						<div className='grid gap-2'>
							<label className='text-sm'>Tags (optional)</label>
							<p className='text-xs text-muted-foreground'>
								Enter your own tags or select from the list. Type the tag and
								press enter to add.
							</p>
							<TagInput
								value={tags}
								onChange={setTags}
								suggestions={suggestedTags}
								maxTags={5}
							/>
						</div>

						{/* Members */}
						{flowType !== "personal" && (
							<div className='grid gap-2'>
								<label className='text-sm'>
									{flowType === "couple" ? "Partner Email" : "Add Members"}
								</label>
								<p className='text-xs text-muted-foreground'>
									{flowType === "couple"
										? "Add partner's email or username with whom you want to share this flow"
										: "Add member emails or username with whom you want to share this flow"}
								</p>
								<MemberInput
									value={members}
									onChange={setMembers}
									suggestions={friendSuggestions}
									placeholder={
										flowType === "couple"
											? "Enter partner's email or username..."
											: "Enter member emails or username..."
									}
									maxMembers={flowType === "couple" ? 1 : 4}
								/>
							</div>
						)}
					</div>

					<DialogFooter>
						<DialogClose asChild>
							<Button
								variant='secondary'
								className='text-gray-600'
								onClick={handleOnClose}
							>
								Cancel
							</Button>
						</DialogClose>
						<Button
							variant='primary'
							type='submit'
							disabled={isPending}
						>
							{isPending
								? flow
									? "Saving..."
									: "Creating..."
								: flow
								? "Save changes"
								: "Create flow"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
