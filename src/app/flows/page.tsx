// src/app/diaries/page.tsx
"use client"
import BottomControls from "@/components/bottom-controls/bottom-controls";
import LeftNavbar from "@/components/left-navbar/left-navbar";
import Icons from "@/components/ui/icons";

const Flows = () => {
	return (
		<div className='p-5 flex flex-col relative w-full flex-1'>
			<div className='flex gap-10 flex-1'>
				<LeftNavbar />
				<div className='flex flex-col relative w-full'>
					<div className='flex-1 flex flex-col gap-5 relative'>
						<h1 className='font-pt-sans text-2xl'>Your Flows</h1>
						<div className='flex flex-1 flex-col relative overflow-hidden'>
							<div>
								<div className="flex items-center rounded-full gap-2 border w-[40%] min-w-80 px-3 py-1.5">
									<Icons.search/>
									<input type="text" placeholder="Search you last flows" className="text-gray-800 w-full font-cabin focus:ring-0 outline-none" />
								</div>
							</div>
							<div>

							</div>
						</div>
					</div>
					<BottomControls />
				</div>
			</div>
		</div>
	);
}

export default Flows;