"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandInput,
} from "@/components/ui/command";
import { X } from "lucide-react";
import { predefinedTags } from "@/lib/constants/tags";
import { Badge } from "../ui/badge";

interface TagInputProps {
	value: string[];
	onChange: (tags: string[]) => void;
	suggestions?: string[];
	maxTags?: number;
	placeholder?: string;
}

export default function TagInput({
	value,
	onChange,
	suggestions = [],
	maxTags = 5,
	placeholder = "Add tags...",
}: TagInputProps) {
	const [input, setInput] = useState("");
	const [open, setOpen] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleAddTag = (tag: string) => {
		const cleaned = tag.trim();
		if (!cleaned || value.includes(cleaned) || value.length >= maxTags) return;
		onChange([...value, cleaned]);
		setInput("");
	};

	const handleRemoveTag = (tag: string) => {
		onChange(value.filter((t) => t !== tag));
	};

	const allSuggestions = Array.from(
		new Set([...predefinedTags, ...suggestions])
	);

	const filteredSuggestions = allSuggestions.filter(
		(s) =>
			(input.trim() === ""
				? true
				: s.toLowerCase().includes(input.toLowerCase())) && !value.includes(s)
	);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && input.trim()) {
			e.preventDefault();
			handleAddTag(input);
		} else if (e.key === "Backspace" && !input && value.length > 0) {
			handleRemoveTag(value[value.length - 1]);
		}
	};

	return (
		<div className='w-full flex flex-col gap-2'>
			<div className='flex flex-wrap gap-2'>
				{value.map((tag) => (
					<Badge
                        key={tag}
                        variant="secondary"
					>
						<span>#{tag}</span>
						<button
							onClick={() => handleRemoveTag(tag)}
							className='hover:text-destructive cursor-pointer'
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
								? filteredSuggestions.map((tag) => (
										<CommandItem
											key={tag}
											onSelect={() => {
												handleAddTag(tag);
												setOpen(false);
												inputRef.current?.focus();
											}}
											className='cursor-pointer'
										>
											#{tag}
										</CommandItem>
								  ))
								: input.trim() &&
								  !value.includes(input.trim()) && (
										<CommandItem
											onSelect={() => {
												handleAddTag(input);
												setOpen(false);
												inputRef.current?.focus();
											}}
											className='cursor-pointer'
										>
											Create "#{input}"
										</CommandItem>
								  )}
						</CommandGroup>
					)}
				</Command>
			</div>
		</div>
	);
}
