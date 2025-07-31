"use client";

import { useRef, useState, useEffect } from "react";
import {
	Command,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface FriendSuggestion {
	user_id: string;
	username: string;
	email: string;
	avatar_url?: string;
}

export interface MemberEntry {
	id?: string;
	email: string;
}

interface MemberInputProps {
	value: MemberEntry[];
	onChange: (members: MemberEntry[]) => void;
	suggestions?: FriendSuggestion[];
	maxMembers?: number;
	placeholder?: string;
}

function isValidEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function MemberInput({
	value,
	onChange,
	suggestions = [],
	maxMembers = 5,
	placeholder = "Add member email...",
}: MemberInputProps) {
	const [input, setInput] = useState("");
	const [open, setOpen] = useState(false);
	const [dropdownPosition, setDropdownPosition] = useState<"top" | "bottom">(
		"bottom"
	);
	const inputRef = useRef<HTMLInputElement>(null);
	const commandRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open || !commandRef.current || !inputRef.current) return;

		const handlePosition = () => {
			const inputRect = inputRef.current!.getBoundingClientRect();
			const viewportHeight = window.innerHeight;
			const spaceBelow = viewportHeight - inputRect.bottom;
			const spaceAbove = inputRect.top;

			if (spaceAbove > spaceBelow && spaceAbove > 200) {
				setDropdownPosition("top");
			} else {
				setDropdownPosition("bottom");
			}
		};

		handlePosition();
		window.addEventListener("resize", handlePosition);
		window.addEventListener("scroll", handlePosition);

		return () => {
			window.removeEventListener("resize", handlePosition);
			window.removeEventListener("scroll", handlePosition);
		};
	}, [open]);

	const handleAddMember = (entry: MemberEntry) => {
		if (
			!entry.email.trim() ||
			value.some((v) => v.email === entry.email) ||
			value.length >= maxMembers
		)
			return;
		onChange([...value, entry]);
		setInput("");
	};

	const handleRemoveMember = (email: string) => {
		onChange(value.filter((e) => e.email !== email));
	};

	const filteredSuggestions = suggestions.filter(
		(s) =>
			(input.trim() === "" ||
				s.username?.toLowerCase().includes(input.toLowerCase()) ||
				s.email?.toLowerCase().includes(input.toLowerCase())) &&
			!value.some((v) => v.email === s.email)
	);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && input.trim()) {
			e.preventDefault();
			if (isValidEmail(input)) {
				handleAddMember({ email: input.trim() });
			}
		} else if (e.key === "Backspace" && !input && value.length > 0) {
			handleRemoveMember(value[value.length - 1].email);
		}
	};

	return (
		<div className='w-full flex flex-col gap-2'>
			<div className='flex flex-wrap gap-2'>
				{value.map((member) => (
					<Badge key={member.email} variant='secondary'>
						<span>{member.email}</span>
						<button
							onClick={() => handleRemoveMember(member.email)}
							className='hover:text-destructive cursor-pointer ml-1'
						>
							<X className='h-3 w-3' />
						</button>
					</Badge>
				))}
			</div>

			<div className='relative'>
				<Command ref={commandRef} className='border rounded' style={{ zIndex: 50 }}>
					<CommandInput
						ref={inputRef}
						value={input}
						onValueChange={(val) => {
							setInput(val);
							setOpen(val.length > 0);
						}}
						onKeyDown={handleKeyDown}
						placeholder={placeholder}
						className='border-0 focus:ring-0'
						onFocus={() => setOpen(true)}
						onBlur={() => setTimeout(() => setOpen(false), 100)}
					/>
					{open && (
						<CommandGroup
							className={`absolute w-full bg-white border shadow-lg overflow-y-auto max-h-[12rem] z-[60] ${
								dropdownPosition === "top"
									? "bottom-full mb-1"
								: "top-full mt-1"
							}`}
						>
							{filteredSuggestions.length > 0 ? (
								filteredSuggestions.map( ( friend ) => (
									<CommandItem
										key={friend.email}
										onSelect={() => {
											handleAddMember( { id: friend.user_id, email: friend.email } );
											setOpen( false );
											inputRef.current?.focus();
										}}
										className='cursor-pointer flex items-center gap-3 py-2'
									>
										<img
											src={friend.avatar_url || "/default-avatar.png"}
											alt={friend.username || "Friend"}
											width={24}
											height={24}
											className='rounded-full'
										/>
										<div className='flex flex-col'>
											<p className='text-sm font-medium'>{friend.username}</p>
											<p className='text-xs text-muted-foreground'>
												{friend.email}
											</p>
										</div>
									</CommandItem>
								) )
							) : input.trim() && isValidEmail( input ) && !value.some( ( v ) => v.email === input ) ? (
								<CommandItem
									onSelect={() => {
										handleAddMember( { email: input.trim() } );
										setOpen( false );
										inputRef.current?.focus();
									}}
									className='cursor-pointer text-primary'
								>
									Invite “{input}”
								</CommandItem>
							) : (
								<CommandItem disabled className='text-muted-foreground'>
									No friends found. Add a valid email to invite.
								</CommandItem>
							)}
						</CommandGroup>
					)}
				</Command>
			</div>
		</div>
	);
}
