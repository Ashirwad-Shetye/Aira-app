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
import MemberInput from "../member-input/member-input";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "next-auth/react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export interface NewFlowDialogProps {
	flow?: Flow;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	onSave?: (data: {
		id?: string;
		title: string;
		bio?: string;
		tags?: string[];
		members?: string[];
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
	const [isPending, startTransition] = useTransition();
	const [tags, setTags] = useState<string[]>(flow?.tags ?? []);
	const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
	const [flowType, setFlowType] = useState<"personal" | "shared" | "couple">(
		"personal"
	);
	const [members, setMembers] = useState<string[]>([]);
	const { data: session } = useSession();

	useEffect(() => {
		if (flow) {
			setTitle(flow.title || "Untitled Flow");
			setBio(flow.bio || "");
			setTags(flow?.tags ?? []);
		} else {
			setTitle("Untitled Flow");
			setBio("");
		}
	}, [flow]);

	useEffect(() => {
		const fetchSuggestedTags = async () => {
			if (!session?.user?.id) return;

			const { data, error } = await supabase.rpc("get_user_flow_tags", {
				user_id_input: session.user.id,
			});

			if (error) {
				console.error("Error fetching tags:", error);
			} else {
				setSuggestedTags(data ?? []);
			}
		};

		fetchSuggestedTags();
	}, [session]);

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (!title.trim()) return;
		const data = {
			id: flow?.id,
			title: title.trim(),
			bio: bio.trim(),
			tags,
			members: flowType !== "personal" ? members : [],
			type: flowType,
		};
		if (onSave) {
			startTransition(() => onSave(data));
		} else {
			startTransition(() => {
				createFlow({ title: data.title, bio: data.bio });
			});
		}
	}

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
				<DialogTitle id='dialog-title'>
					<Icons.flow />
					<p>{flow ? "Edit flow" : "Create new flow"}</p>
				</DialogTitle>
				<DialogHeader>
					<DialogDescription
						id='dialog-description'
						className='text-xs'
					>
						Flows hold your thoughts over time. Set one up and begin writing
						your Moments.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className='grid gap-4 my-3'>
						<div className='grid gap-2'>
							<label className='text-sm'>Flow Type</label>
							<p className='text-xs text-muted-foreground'>
								Choose how you want to use this flow — for yourself, with
								someone close, or as a group.
							</p>

							<ToggleGroup
								type='single'
								value={flowType}
								onValueChange={(val: string) =>
									setFlowType((val as typeof flowType) ?? "personal")
								}
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

							<p className='text-xs text-primary'>
								{flowType === "personal" &&
									"This flow is private — only you can view and write in it."}
								{flowType === "shared" &&
									"Invite up to 4 others to contribute. Everyone can write, read, and reflect together."}
								{flowType === "couple" &&
									"Just for you and your partner — a shared space to connect and express privately."}
							</p>
						</div>
						<div className='grid gap-2'>
							<div className='flex flex-col gap-1'>
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
							</div>
							<input
								id='flow-name-1'
								name='flow-name'
								placeholder='e.g. Morning Reflections, Letters to Myself'
								value={title}
								maxLength={100}
								onChange={(e) => setTitle(e.currentTarget.value)}
								className='px-3 py-1 text-sm border rounded focus:ring-0 outline-none'
							/>
							<p className='text-xs text-gray-700 text-right'>
								({title.length} / 100)
							</p>
						</div>

						<div className='grid gap-2'>
							<label className='text-sm'>About this Flow (optional)</label>
							<textarea
								placeholder='e.g. A space to write honestly each morning'
								value={bio}
								maxLength={300}
								onChange={(e) => setBio(e.currentTarget.value)}
								className='px-3 py-1 h-20 text-sm border rounded focus:ring-0 outline-none'
							/>
							<p className='text-xs text-gray-700 text-right'>
								({bio.length} / 300)
							</p>
						</div>

						<div className='grid gap-2'>
							<label className='text-sm'>Tags (optional)</label>
							<TagInput
								value={tags}
								onChange={setTags}
								suggestions={suggestedTags}
								maxTags={5}
							/>
						</div>

						{flowType !== "personal" && (
							<div className='grid gap-2'>
								<label className='text-sm'>
									{flowType === "couple"
										? "Partner Email (optional - can be added later)"
										: "Add Members (optional - can be added later)"}
								</label>
								<MemberInput
									value={members}
									onChange={setMembers}
									placeholder={
										flowType === "couple"
											? "Enter partner's email..."
											: "Enter member emails..."
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
