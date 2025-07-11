// src/app/flows/[flowId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BottomControls from "@/components/bottom-controls/bottom-controls";
import LeftNavbar from "@/components/left-navbar/left-navbar";
import { Button } from "@/components/ui/button";
import Icons from "@/components/ui/icons";
import { supabase } from "@/lib/supabase/client";

const FlowIdPage = () => {
	const { flowId } = useParams();
	const [flowTitle, setFlowTitle] = useState("...");
	const router = useRouter();

	useEffect(() => {
		async function fetchFlow() {
			if (!flowId || typeof flowId !== "string") return;

			const { data, error } = await supabase
				.from("flows")
				.select("title")
				.eq("id", flowId)
				.single();

			if (error) {
				console.error("Failed to fetch flow:", error);
				return;
			}

			setFlowTitle(data.title);
		}

		fetchFlow();
	}, [flowId]);

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
							>
								Back
							</Button>
							<h1 className='font-pt-sans text-2xl'>{flowTitle}</h1>
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
};

export default FlowIdPage;