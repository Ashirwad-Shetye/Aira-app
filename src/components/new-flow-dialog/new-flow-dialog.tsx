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
import { useState, useTransition } from "react";
import { createFlow } from "@/lib/data/create-flow";

export function NewFlowDialog() {
	const [title, setTitle] = useState<string>("Untitled Flow");
	const [bio, setBio] = useState<string>("");
	const [isPending, startTransition] = useTransition();

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (!title.trim()) return;

		startTransition(() => {
			createFlow({ title: title.trim(), bio: bio.trim() });
		});
	}

	const handleOnClose = () => {
		setBio( "" )
		setTitle( "Untitled Flow" );
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<button
					type='button'
					className='px-10 h-20 group cursor-pointer select-none font-pt-sans text-lg font-semibold rounded-lg text-white bg-gradient-to-br from-[#B2CEF3] to-[#DFEDFF] flex items-center justify-center'
				>
					<div className='group-hover:scale-105 gap-2 duration-200 group-active:scale-95 flex items-center justify-center'>
						<Icons.flow />
						<h1>Start a new flow</h1>
					</div>
				</button>
			</DialogTrigger>
			<DialogContent
				className='w-[50rem]'
				role='dialog'
			>
				<DialogTitle
					id='dialog-title'
					className='flex gap-2 items-center font-pt-sans'
				>
					<Icons.flow />
					<p className='font-normal'>Create new flow</p>
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
							<div className='flex flex-col gap-1'>
								<label htmlFor='flow-name-1'>Flow Title</label>
								<p
									id='flow-name-desc'
									className='text-xs text-muted-foreground'
								>
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
							<p
								id='flow-name-counter'
								className='text-xs text-gray-700 text-right'
							>
								({title.length} / 100)
							</p>
						</div>

						<div className='grid gap-2'>
							<div className='flex flex-col gap-1'>
								<label htmlFor='flow-bio-1'>About this Flow (optional)</label>
								<p
									id='flow-bio-desc'
									className='text-xs text-muted-foreground'
								>
									Add a short note about this Flow. What's it for? Why did you
									start it?
								</p>
							</div>
							<textarea
								id='flow-bio-1'
								name='flow-bio'
								placeholder='e.g. A space to write honestly each morning'
								value={bio}
								maxLength={300}
								onChange={(e) => setBio(e.currentTarget.value)}
								className='px-3 py-1 h-20 text-sm border rounded focus:ring-0 outline-none'
							/>
							<p
								id='flow-bio-counter'
								className='text-xs text-gray-700 text-right'
							>
								({bio.length} / 300)
							</p>
						</div>
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
							{isPending ? "Creating..." : "Save changes"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}