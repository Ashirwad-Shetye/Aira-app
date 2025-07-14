"use client";

import { Flow } from "@/types/flows";
import { Moment } from "@/types/moments";
import BottomControls from "@/components/bottom-controls/bottom-controls";
import LeftNavbar from "@/components/left-navbar/left-navbar";
import { Button } from "@/components/ui/button";
import Icons from "@/components/ui/icons";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/date-convertors";

export default function FlowIdClient({
	flow,
	moments,
}: {
	flow: Flow;
	moments: Moment[];
}) {
	const router = useRouter();

	return (
		<div className='p-5 flex flex-col overflow-hidden relative w-full flex-1'>
			<div className='flex gap-5 flex-1 relative'>
				<LeftNavbar />
				<div className='flex flex-col overflow-hidden relative w-full'>
					<div className='flex-1 flex flex-col gap-5 relative'>
						<div className='flex items-center gap-5'>
							<Button
								variant={"secondary"}
								onClick={() => router.back()}
								className='flex items-center gap-1 text-gray-500'
							>
								<Icons.arrowLeft />
								<p>Back</p>
							</Button>
							<h1 className='font-pt-sans text-2xl'>
								{flow?.title || "Untitled Flow"}
							</h1>
						</div>

						<div>
							<div className='flex items-center bg-white rounded-full gap-2 border w-[40%] min-w-80 px-3 py-1.5'>
								<Icons.search />
								<input
									type='text'
									placeholder='Search your moments'
									className='text-gray-800 w-full font-cabin focus:ring-0 outline-none'
								/>
							</div>
						</div>

						<div className='grid grid-cols-3 gap-4'>
							{moments.length === 0 ? (
								<p className='text-muted-foreground'>
									No moments yet. Add your first one.
								</p>
							) : (
								moments.map((moment) => (
									<button
										key={moment.id}
										onClick={() =>
											router.push(`/flows/${flow.id}/moments/${moment.id}`)
										}
										className='border rounded-xl p-4 text-left hover:shadow-md transition bg-white'
									>
										<p className='text-sm text-gray-500 mb-1'>
											{formatDate(moment.created_at)}
										</p>
										<h2 className='text-md font-semibold'>
											{moment.title || "Untitled Moment"}
										</h2>
									</button>
								))
							)}
						</div>
					</div>
					<BottomControls />
				</div>
			</div>
		</div>
	);
}
