"use client";

import { Flow } from "@/types/flows";
import BottomControls from "@/components/bottom-controls/bottom-controls";
import LeftNavbar from "@/components/left-navbar/left-navbar";
import { Button } from "@/components/ui/button";
import Icons from "@/components/ui/icons";
import { useRouter } from "next/navigation";

export default function FlowIdClient({ flow }: { flow: Flow }) {
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
						<div className='flex flex-1 gap-5 flex-col relative overflow-hidden'>
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
						</div>
					</div>
					<BottomControls />
				</div>
			</div>
		</div>
	);
}
