// src/app/diaries/page.tsx
"use client"
import BottomControls from "@/components/bottom-controls/bottom-controls";
import LeftNavbar from "@/components/left-navbar/left-navbar";
import { NewFlowDialog } from "@/components/new-flow-dialog/new-flow-dialog";
import TagsBar from "@/components/tags-bar/tags-bar";
import Icons from "@/components/ui/icons";

const Flows = () => {
	const tags = [
		"mindfulness",
		"self help",
		"meditation",
		"personal growth",
		"mental health",
		"gratitude",
		"self care",
		"motivation",
		"reflection",
		"productivity",
		"wellness",
		"stress relief",
		"goal setting",
		"positive thinking",
		"emotional intelligence",
		"self discovery",
		"resilience",
		"habits",
		"self love",
		"mindset",
		"balance",
		"inner peace",
		"journaling",
		"self improvement",
		"awareness",
		"focus",
		"inspiration",
		"daily logs",
		"special",
		"random",
	];
	return (
		<div className='p-5 flex flex-col overflow-hidden relative w-full flex-1'>
			<div className='flex gap-5 flex-1 relative'>
				<LeftNavbar />
				<div className='flex flex-col overflow-hidden relative w-full'>
					<div className='flex-1 flex flex-col gap-5 relative'>
						<h1 className='font-pt-sans text-2xl'>Your Flows</h1>
						<div className='flex flex-1 gap-5 flex-col relative overflow-hidden'>
							<div>
								<div className='flex items-center bg-white rounded-full gap-2 border w-[40%] min-w-80 px-3 py-1.5'>
									<Icons.search />
									<input
										type='text'
										placeholder='Search you last flows'
										className='text-gray-800 w-full font-cabin focus:ring-0 outline-none'
									/>
								</div>
							</div>
							<div className='flex gap-5'>
								<NewFlowDialog/>
								<button
									type='button'
									className='px-10 h-20 group cursor-pointer select-none font-pt-sans text-lg font-semibold rounded-lg text-white bg-gradient-to-br from-[#b7da81] to-[#E8F2D9] flex items-center justify-center'
								>
									<div className='group-hover:scale-105 gap-2 duration-200 group-active:scale-95 flex items-center justify-center'>
										<Icons.moment />
										<h1>New moment in flow</h1>
									</div>
								</button>
							</div>
							<TagsBar tags={tags}/>
						</div>
					</div>
					<BottomControls />
				</div>
			</div>
		</div>
	);
}

export default Flows;