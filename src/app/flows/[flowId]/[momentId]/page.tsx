"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import debounce from "lodash/debounce";
import { Button } from "@/components/ui/button";
import Icons from "@/components/ui/icons";
import LeftNavbar from "@/components/left-navbar/left-navbar";
import BottomControls from "@/components/bottom-controls/bottom-controls";
import CustomBreadcrumb from "@/components/custom-breadcrumb/custom-breadcrumb";
import MomentEditor from "@/components/editor/MomentEditor";

export default function MomentEditorPage() {
	const { flowId, momentId } = useParams();
	const router = useRouter();

	const [flowTitle, setFlowTitle] = useState<string>("");
	const [title, setTitle] = useState<string>("");
	const [content, setContent] = useState<string>("");
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (
			!flowId ||
			!momentId ||
			typeof flowId !== "string" ||
			typeof momentId !== "string"
		)
			return;

		const fetchData = async () => {
			setIsLoading(true);
			setError(null);

			const [
				{ data: flow, error: flowErr },
				{ data: moment, error: momentErr },
			] = await Promise.all([
				supabase.from("flows").select("title").eq("id", flowId).single(),
				supabase
					.from("moments")
					.select("title, content")
					.eq("id", momentId)
					.single(),
			]);

			if (flowErr || momentErr || !flow || !moment) {
				console.error("❌ Failed to load:", { flowErr, momentErr });
				setError("Failed to load moment or flow.");
				setIsLoading(false);
				return;
			}

			setFlowTitle(flow.title);
			setTitle(moment.title || "");
			setContent(moment.content || "");
			setIsLoading(false);
		};

		fetchData();
	}, [flowId, momentId]);

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

		if (error) console.error("❌ Failed to save moment:", error);
		setIsSaving(false);
	};

	const debouncedSave = useCallback(
		debounce((t: string, c: string) => {
			saveMoment(t, c);
		}, 1500),
		[momentId]
	);

	if (isLoading) {
		return (
			<div className='p-5 flex flex-col overflow-hidden relative w-full flex-1'>
				<div className='flex gap-5 flex-1 relative overflow-hidden'>
					<LeftNavbar />
					<div className='flex flex-col w-full'>
						<div className='flex items-center gap-5 mb-5'>
							<Button
								variant='secondary'
								onClick={() => router.back()}
								className='flex items-center gap-1 text-gray-500'
							>
								<Icons.arrowLeft />
								<p>Back</p>
							</Button>
						<div className='h-8 w-40 bg-gray-100 animate-pulse rounded' />
						</div>
						<div className='h-8 w-2/3 bg-gray-100 animate-pulse rounded mb-3' />
						<div className='flex-1 w-full bg-gray-100 animate-pulse rounded' />
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='p-5 text-red-600 text-center'>
				<p>{error}</p>
			</div>
		);
	}

	return (
		<div className='p-5 flex flex-col overflow-hidden relative w-full flex-1 min-h-0'>
			<div className='flex gap-5 flex-1 relative min-h-0'>
				<LeftNavbar />
				<div className='flex flex-col overflow-hidden relative w-full min-h-0'>
					<div className='flex-1 flex flex-col gap-10 relative min-h-0'>
						<div className='flex items-center gap-5'>
							<Button
								variant='secondary'
								onClick={() => router.back()}
								className='flex items-center gap-1 text-gray-500'
							>
								<Icons.arrowLeft />
								<p>Back</p>
							</Button>
							<CustomBreadcrumb
								flowId={flowId as string}
								flowTitle={flowTitle}
								momentId={momentId as string}
								momentTitle={title}
								isLoading={false}
							/>
						</div>
						<div className='flex-1 flex flex-col gap-4 sm:w-full md:w-[70%] max-w-7xl mx-auto overflow-y-auto pr-3 pb-8 min-h-0'>
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
							<div className='flex-1 flex flex-col overflow-hidden relative min-h-0'>
								<MomentEditor
									initialContent={content}
									onChange={(html) => {
										setContent(html);
										debouncedSave(title, html);
									}}
								/>
							</div>
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