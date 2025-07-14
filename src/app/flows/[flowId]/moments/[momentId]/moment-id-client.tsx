"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import debounce from "lodash/debounce";
import { Button } from "@/components/ui/button";
import Icons from "@/components/ui/icons";
import LeftNavbar from "@/components/left-navbar/left-navbar";
import BottomControls from "@/components/bottom-controls/bottom-controls";
import CustomBreadcrumb from "@/components/custom-breadcrumb/custom-breadcrumb";
import { supabase } from "@/lib/supabase/client";

export default function MomentEditorClient({
	flow,
	moment,
}: {
	flow: { id: string; title: string };
	moment: { id: string; title: string; content: string };
}) {
	const router = useRouter();
	const [title, setTitle] = useState(moment.title);
	const [content, setContent] = useState(moment.content);
	const [isSaving, setIsSaving] = useState(false);

	const saveMoment = async (updatedTitle: string, updatedContent: string) => {
		setIsSaving(true);
		const { error } = await supabase
			.from("moments")
			.update({
				title: updatedTitle,
				content: updatedContent,
				updated_at: new Date().toISOString(),
			})
			.eq("id", moment.id);

		if (error) console.error("❌ Failed to save moment:", error);
		setIsSaving(false);
	};

	const debouncedSave = useCallback(
		debounce((t: string, c: string) => {
			saveMoment(t, c);
		}, 2000),
		[moment.id]
	);

	return (
		<div className='p-5 flex flex-col overflow-hidden relative w-full flex-1'>
			<div className='flex gap-5 flex-1 relative'>
				<LeftNavbar />
				<div className='flex flex-col overflow-hidden relative w-full'>
					<div className='flex-1 flex flex-col gap-10 relative'>
						<div className='flex items-center gap-5'>
							<Button
								variant={"secondary"}
								onClick={() => router.back()}
								className='flex items-center gap-1 text-gray-500'
							>
								<Icons.arrowLeft />
								<p>Back</p>
							</Button>
							<CustomBreadcrumb
								flowId={flow.id}
								flowTitle={flow.title}
								momentId={moment.id}
								momentTitle={title}
								isLoading={false}
							/>
						</div>
						<div className='flex flex-1 flex-col gap-4 sm:w-full md:w-[70%] max-w-7xl mx-auto overflow-y-auto pr-3 pb-20'>
							<input
								type='text'
								placeholder='Your moment title...'
								className='text-3xl font-pt-sans w-full focus:outline-none'
								value={title}
								onChange={(e) => {
									setTitle(e.target.value);
									debouncedSave(e.target.value, content);
								}}
							/>
							<textarea
								placeholder='Start writing your thoughts...'
								className='text-base min-h-[300px] flex-1 w-full resize-none focus:outline-none'
								value={content}
								onChange={(e) => {
									setContent(e.target.value);
									debouncedSave(title, e.target.value);
								}}
							/>
						</div>
					</div>
					<BottomControls
						status={true}
						isSaving={isSaving}
					/>
				</div>
			</div>
		</div>
	);
}
