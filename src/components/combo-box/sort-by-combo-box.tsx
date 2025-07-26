"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import Icons from "../ui/icons";

const sortByVals = [
	{
		value: "last created",
		label: "Last Created",
	},
	{
		value: "last edited",
		label: "Last Edited",
	},
	{
		value: "oldest created",
		label: "Oldest Created",
	},
	{
		value: "oldest edited",
		label: "Oldest Edited",
	}
];

interface SortByComboBoxProps{
    setValue: ( value: string ) => void
    value: string
}

export function SortByComboBox( {
    value,
    setValue
}:SortByComboBoxProps) {
	const [open, setOpen] = React.useState(false);

	return (
		<Popover
			open={open}
			onOpenChange={setOpen}
		>
			<PopoverTrigger asChild>
				<Button
					variant='outline'
					role='combobox'
					aria-expanded={open}
					className='w-40 justify-between'
                >
                    <div className="flex items-center gap-1">
                        <Icons.sort className="opacity-50"/>
                        {value
                            ? sortByVals.find((sortByVal) => sortByVal.value === value)?.label
                            : "Sort by"}
                    </div>
					<ChevronsUpDown className='opacity-50' />
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-40 p-0'>
				<Command>
					<CommandInput
						placeholder='Search...'
						className='h-9'
					/>
					<CommandList>
						<CommandEmpty>No match found.</CommandEmpty>
						<CommandGroup>
							{sortByVals.map((sortByVal) => (
								<CommandItem
									key={sortByVal.value}
									value={sortByVal.value}
									onSelect={(currentValue) => {
										setValue(currentValue === value ? "" : currentValue);
										setOpen(false);
									}}
									className="text-xs"
								>
									{sortByVal.label}
									<Check
										className={cn(
											"ml-auto",
											value === sortByVal.value ? "opacity-100" : "opacity-0"
										)}
									/>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
