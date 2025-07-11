"use client"
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

export function NewFlowDialog() {
	return (
		<Dialog>
			<form>
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
				<DialogContent className='w-[50rem]'>
					<DialogHeader>
						<DialogTitle className='flex gap-2 items-center font-pt-sans'>
							<Icons.flow />
							<p>Create new flow</p>
						</DialogTitle>
						<DialogDescription className='text-xs'>
							Flows hold your thoughts over time. Set one up and begin writing
							your Moments.
						</DialogDescription>
					</DialogHeader>
					<div className='grid gap-4'>
						<div className='grid gap-2'>
							<div className='flex flex-col gap-1'>
								<label htmlFor='flow-name-1'>Flow Title</label>
								<p className='text-xs text-muted-foreground'>
									This is the name of your Flow — think of it like a personal
									journal.
								</p>
							</div>
							<input
								id='flow-name-1'
								name='flow-name'
								placeholder='e.g. Morning Reflections, Letters to Myself'
								defaultValue='Untitled Flow'
								className='px-3 py-1 text-sm border rounded focus:ring-0 outline-none'
							/>
						</div>
						<div className='grid gap-2'>
							<div className='flex flex-col gap-1'>
								<label htmlFor='flow-name-1'>About this Flow</label>
								<p className='text-xs text-muted-foreground'>
									Add a short note about this Flow. What&apos;s it for? Why did
									you start it?
								</p>
							</div>
							<input
								id='flow-name-1'
								name='flow-name'
								placeholder='e.g. Morning Reflections, Shared Thoughts with Jane'
								defaultValue='Untitled Flow'
								className='px-3 py-1 text-sm border rounded focus:ring-0 outline-none'
							/>
						</div>
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<button>Cancel</button>
						</DialogClose>
						<button type='submit'>Save changes</button>
					</DialogFooter>
				</DialogContent>
			</form>
		</Dialog>
	);
}
