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
import { supabase } from "@/lib/supabase/client";
import { useSession } from "next-auth/react";

export interface NewFlowDialogProps {
  flow?: Flow;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: ( data: { id?: string; title: string; bio?: string, tags?: string[] } ) => void;
  children?: ReactElement;
  clearOnClose?: boolean
}

export function NewFlowDialog(props: NewFlowDialogProps = {}) {
  const { flow, open, onOpenChange, onSave, children, clearOnClose=true } = props;
  const [title, setTitle] = useState<string>(flow?.title || "Untitled Flow");
  const [bio, setBio] = useState<string>(flow?.bio || "");
  const [ isPending, startTransition ] = useTransition();
  const [tags, setTags] = useState<string[]>(flow?.tags ?? []);
  const [ suggestedTags, setSuggestedTags ] = useState<string[]>( [] );
  
  const { data: session } = useSession()

  useEffect(() => {
    if (flow) {
      setTitle(flow.title || "Untitled Flow");
      setBio( flow.bio || "" );
      setTags(flow?.tags ?? []);
    } else {
      setTitle("Untitled Flow");
      setBio("");
    }
  }, [ flow ] );
  
  useEffect(() => {
		const fetchSuggestedTags = async () => {
			if (!flow?.id) return;

			const { data, error } = await supabase.rpc("get_user_flow_tags", {
				user_id_input: session?.user?.id,
			});

			if (error) {
				console.error("Error fetching tags:", error);
			} else {
				setSuggestedTags(data ?? []);
			}
		};

		fetchSuggestedTags();
	}, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) return;
    const data = { id: flow?.id, title: title.trim(), bio: bio.trim(), tags: tags };
    if (onSave) {
      startTransition(() => onSave(data));
    } else {
      startTransition(() => {
        createFlow({ title: data.title, bio: data.bio });
      });
    }
  }

  const handleOnClose = () => {
    if ( clearOnClose ) {
       setBio("");
				setTitle("Untitled Flow");
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
				className='w-[50rem]'
				role='dialog'
			>
				<DialogTitle id='dialog-title'>
					<Icons.flow />
					<p className=''>{flow ? "Edit flow" : "Create new flow"}</p>
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
								<label htmlFor='flow-name-1 text-sm'>Flow Title</label>
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
								<label htmlFor='flow-bio-1 text-sm'>
									About this Flow (optional)
								</label>
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
						<div className='grid gap-2'>
							<div className='flex flex-col gap-1'>
								<label htmlFor='flow-tags text-sm'>Tags (optional)</label>
								<p
									id='flow-tags-desc'
									className='text-xs text-muted-foreground'
								>
									Add tags to categorize your flow. Use Enter or click to add.
									Max 5 tags.
								</p>
							</div>
							<TagInput
								value={tags}
								onChange={setTags}
								suggestions={suggestedTags}
								maxTags={5}
							/>
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