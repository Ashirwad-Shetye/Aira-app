// src/app/flows/[flowId]/moments/new/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import debounce from "lodash/debounce";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Icons from "@/components/ui/icons";
import BottomControls from "@/components/bottom-controls/bottom-controls";
import LeftNavbar from "@/components/left-navbar/left-navbar";
import CustomBreadcrumb from "@/components/custom-breadcrumb/custom-breadcrumb";

const NewMoment = () => {
	const { flowId } = useParams();
	const router = useRouter();
	const { data: session, status } = useSession();

	const [momentId, setMomentId] = useState<string>("");
	const [title, setTitle] = useState<string>("");
	const [content, setContent] = useState<string>("");
	const [isSaving, setIsSaving] = useState<boolean>(false);

	const createMoment = async (newTitle: string, newContent: string) => {
		if (!flowId || typeof flowId !== "string" || !session?.user?.id) return;

		const { data, error } = await supabase
			.from("moments")
			.insert({
				flow_id: flowId,
				title: newTitle,
				content: newContent,
				user_id: session.user.id,
			})
			.select("id")
			.single();

		if (error || !data?.id) {
			console.error("❌ Failed to create moment:", error);
			return;
		}

		localStorage.setItem(`aira-last-draft-${flowId}`, data.id);
		router.replace(`/flows/${flowId}/moments/${data.id}`);
	};

	const debouncedTrigger = useCallback(
		debounce((t: string, c: string) => {
			if ((t.trim() !== "" || c.trim() !== "") && !momentId) {
				createMoment(t, c);
			}
		}, 1000),
		[momentId, session?.user?.id, flowId]
	);

	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setTitle(value);
		debouncedTrigger(value, content);
	};

	const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const value = e.target.value;
		setContent(value);
		debouncedTrigger(title, value);
	};

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
								flowId={flowId as string}
								flowTitle={"New Flow"}
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
							<p className='text-sm text-muted-foreground'>
								Start typing to create your Moment. It will auto-save once you
								begin.
							</p>
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

export default NewMoment;