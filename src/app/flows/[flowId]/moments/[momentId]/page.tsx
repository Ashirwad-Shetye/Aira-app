// src/app/flows/[flowId]/moments/[momentId]/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase/client";
import debounce from "lodash/debounce";
import BottomControls from "@/components/bottom-controls/bottom-controls";
import LeftNavbar from "@/components/left-navbar/left-navbar";
import { Button } from "@/components/ui/button";
import Icons from "@/components/ui/icons";
import CustomBreadcrumb from "@/components/custom-breadcrumb/custom-breadcrumb";
import { Flow } from "@/types/flows";

const MomentEditorPage = () => {
	const { flowId, momentId } = useParams();
	const router = useRouter();
	const { data: session, status } = useSession();

	const [flow, setFlow] = useState<Flow | null>(null);
	const [title, setTitle] = useState<string>("");
	const [content, setContent] = useState<string>("");
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [hasLoaded, setHasLoaded] = useState<boolean>(false);

	useEffect(() => {
		if (
			!flowId ||
			!momentId ||
			status !== "authenticated" ||
			!session?.user?.id
		)
			return;

		const fetchFlowAndMoment = async () => {
			// Fetch flow for breadcrumb
			const { data: flowData } = await supabase
				.from("flows")
				.select("*")
				.eq("id", flowId)
				.single();
			setFlow(flowData);

			// Fetch moment content
			const { data: momentData, error } = await supabase
				.from("moments")
				.select("title, content")
				.eq("id", momentId)
				.single();

			if (error) {
				console.error("❌ Failed to fetch moment:", error);
				return;
			}

			setTitle(momentData.title || "");
			setContent(momentData.content || "");
			setHasLoaded(true);
		};

		fetchFlowAndMoment();
	}, [flowId, momentId, status, session?.user?.id]);

	const saveMoment = async (updatedTitle: string, updatedContent: string) => {
		setIsSaving(true);
		const { error } = await supabase
			.from("moments")
			.update({
				title: updatedTitle,
				content: updatedContent,
				updated_at: new Date().toISOString(),
			})
			.eq("id", momentId);
		if (error) {
			console.error("❌ Failed to save moment:", error);
		}
		setIsSaving(false);
	};

	const debouncedSave = useCallback(
		debounce((t: string, c: string) => {
			saveMoment(t, c);
		}, 2000),
		[momentId]
	);

	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setTitle(value);
		debouncedSave(value, content);
	};

	const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const value = e.target.value;
		setContent(value);
		debouncedSave(title, value);
	};

	if (!hasLoaded) return null;

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
								flowId={flow?.id}
								flowTitle={flow?.title}
								momentId={momentId as string}
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
								onChange={handleTitleChange}
							/>
							<textarea
								placeholder='Start writing your thoughts...'
								className='text-base min-h-[300px] flex-1 w-full resize-none focus:outline-none'
								value={content}
								onChange={handleContentChange}
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
};

export default MomentEditorPage;