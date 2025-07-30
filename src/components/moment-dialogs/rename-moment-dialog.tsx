 "use client";

import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useTransition } from "react";
import Icons from "../ui/icons";
import { Moment } from "@/types/moments";
import { useRef } from "react";

export interface RenameMomentDialogProps {
	moment?: Moment;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (data: { id: string; title: string }) => void;
}

export function RenameMomentDialog({
	moment,
	open,
	onOpenChange,
	onSave,
}: RenameMomentDialogProps) {
	const [title, setTitle] = useState(moment?.title || "Untitled Moment");
	const [isPending, startTransition] = useTransition();
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		if (moment) setTitle(moment.title || "Untitled Moment");
	}, [moment]);

	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
		}
	}, [title, open]);

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (!title.trim()) return;
		startTransition(() => {
			onSave({ id: moment!.id, title: title.trim() });
		});
	}

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className='w-[30rem]'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2'>
						<Icons.edit />
						Rename Moment
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className='grid gap-4 my-3'>
						<div className='grid gap-2'>
							<label htmlFor='moment-title'>Title</label>
							<textarea
								ref={textareaRef}
								id='moment-title'
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								maxLength={300}
								rows={1}
								className='px-3 py-1 text-sm border rounded outline-none focus:ring-0 w-full resize-none overflow-hidden'
							/>
							<p className='text-xs text-muted-foreground text-right'>
								({title.length} / 300)
							</p>
						</div>
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button
								type='button'
								variant='secondary'
							>
								Cancel
							</Button>
						</DialogClose>
						<Button
                            type='submit'
                            variant='primary'
							disabled={isPending}
						>
							{isPending ? "Saving..." : "Save"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}