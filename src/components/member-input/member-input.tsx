"use client"

import { useRef, useState } from "react";
import {
	Command,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MemberInputProps {
	value: string[];
	onChange: (members: string[]) => void;
	suggestions?: string[];
	maxMembers?: number;
	placeholder?: string;
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
	const inputRef = useRef<HTMLInputElement>(null);

	const handleAddMember = (email: string) => {
		const cleaned = email.trim();
		if (!cleaned || value.includes(cleaned) || value.length >= maxMembers)
			return;
		onChange([...value, cleaned]);
		setInput("");
	};

	const handleRemoveMember = (email: string) => {
		onChange(value.filter((e) => e !== email));
	};

	const filteredSuggestions = suggestions.filter(
		(s) =>
			(input.trim() === ""
				? true
				: s.toLowerCase().includes(input.toLowerCase())) && !value.includes(s)
	);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && input.trim()) {
			e.preventDefault();
			handleAddMember(input);
		} else if (e.key === "Backspace" && !input && value.length > 0) {
			handleRemoveMember(value[value.length - 1]);
		}
	};

	return (
		<div className='w-full flex flex-col gap-2'>
			<div className='flex flex-wrap gap-2'>
				{value.map((email) => (
					<Badge
						key={email}
						variant='secondary'
					>
						<span>{email}</span>
						<button
							onClick={() => handleRemoveMember(email)}
							className='hover:text-destructive cursor-pointer ml-1'
						>
							<X className='h-3 w-3' />
						</button>
					</Badge>
				))}
			</div>

			<div className='relative'>
				<Command className='border rounded'>
					<CommandInput
						ref={inputRef}
						value={input}
						onValueChange={(value) => {
							setInput(value);
							setOpen(value.length > 0);
						}}
						onKeyDown={handleKeyDown}
						placeholder={placeholder}
						className='border-0 focus:ring-0'
						onFocus={() => setOpen(true)}
						onBlur={() => setTimeout(() => setOpen(false), 100)}
					/>
					{open && (
						<CommandGroup className='absolute top-10 z-10 w-full bg-white border shadow-lg overflow-y-auto max-h-[10rem]'>
							{filteredSuggestions.length > 0
								? filteredSuggestions.map((email) => (
										<CommandItem
											key={email}
											onSelect={() => {
												handleAddMember(email);
												setOpen(false);
												inputRef.current?.focus();
											}}
											className='cursor-pointer'
										>
											{email}
										</CommandItem>
								  ))
								: input.trim() &&
								  !value.includes(input.trim()) && (
										<CommandItem
											onSelect={() => {
												handleAddMember(input);
												setOpen(false);
												inputRef.current?.focus();
											}}
											className='cursor-pointer'
										>
											Add "{input}"
										</CommandItem>
								  )}
						</CommandGroup>
					)}
				</Command>
			</div>
		</div>
	);
}
