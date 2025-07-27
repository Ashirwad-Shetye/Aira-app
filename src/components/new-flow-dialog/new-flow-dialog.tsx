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

export interface NewFlowDialogProps {
  flow?: { id: string; title: string; bio?: string };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: ( data: { id?: string; title: string; bio?: string } ) => void;
  children?: ReactElement;
  clearOnClose?: boolean
}

export function NewFlowDialog(props: NewFlowDialogProps = {}) {
  const { flow, open, onOpenChange, onSave, children, clearOnClose=true } = props;
  const [title, setTitle] = useState<string>(flow?.title || "Untitled Flow");
  const [bio, setBio] = useState<string>(flow?.bio || "");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (flow) {
      setTitle(flow.title || "Untitled Flow");
      setBio(flow.bio || "");
    } else {
      setTitle("Untitled Flow");
      setBio("");
    }
  }, [flow]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) return;
    const data = { id: flow?.id, title: title.trim(), bio: bio.trim() };
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className='w-[50rem]' role='dialog'>
        <DialogTitle id='dialog-title' className='flex gap-2 items-center font-pt-sans'>
          <Icons.flow />
          <p className='font-normal'>{flow ? "Edit flow" : "Create new flow"}</p>
        </DialogTitle>
        <DialogHeader>
          <DialogDescription id='dialog-description' className='text-xs'>
            Flows hold your thoughts over time. Set one up and begin writing your Moments.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 my-3'>
            <div className='grid gap-2'>
              <div className='flex flex-col gap-1'>
                <label htmlFor='flow-name-1'>Flow Title</label>
                <p id='flow-name-desc' className='text-xs text-muted-foreground'>
                  This is the name of your Flow — think of it like a personal journal.
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
              <p id='flow-name-counter' className='text-xs text-gray-700 text-right'>
                ({title.length} / 100)
              </p>
            </div>
            <div className='grid gap-2'>
              <div className='flex flex-col gap-1'>
                <label htmlFor='flow-bio-1'>About this Flow (optional)</label>
                <p id='flow-bio-desc' className='text-xs text-muted-foreground'>
                  Add a short note about this Flow. What's it for? Why did you start it?
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
              <p id='flow-bio-counter' className='text-xs text-gray-700 text-right'>
                ({bio.length} / 300)
              </p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='secondary' className='text-gray-600' onClick={handleOnClose}>
                Cancel
              </Button>
            </DialogClose>
            <Button variant='primary' type='submit' disabled={isPending}>
              {isPending ? (flow ? "Saving..." : "Creating...") : (flow ? "Save changes" : "Create flow")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}