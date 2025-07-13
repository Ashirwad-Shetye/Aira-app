// src/app/flows/[flowId]/moments/new/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";
import debounce from "lodash/debounce";
import BottomControls from "@/components/bottom-controls/bottom-controls";
import LeftNavbar from "@/components/left-navbar/left-navbar";
import { Button } from "@/components/ui/button";
import Icons from "@/components/ui/icons";
import { Flow } from "@/types/flows";
import CustomBreadcrumb from "@/components/custom-breadcrumb/custom-breadcrumb";

const NewMoment = () => {
	const { flowId } = useParams();
	const router = useRouter();
	const [flow, setFlow] = useState<Flow | null>(null);
	const [momentId, setMomentId] = useState<string>("");
	const [title, setTitle] = useState<string>("");
	const [content, setContent] = useState<string>("");
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [isLoadingFlow, setIsLoadingFlow] = useState<boolean>(true);

	useEffect(() => {
		async function fetchFlow() {
			if (!flowId || typeof flowId !== "string") return;
			setIsLoadingFlow(true);
			const { data, error } = await supabase
				.from("flows")
				.select("*")
				.eq("id", flowId)
				.single();
			if (error) {
				console.error("❌ Failed to fetch flow:", error);
				return;
			}
			setFlow(data);
			setIsLoadingFlow(false);
		}
		fetchFlow();
	}, [flowId]);

	// Auto-create a new moment entry when the page loads
	useEffect(() => {
		if (!momentId && flowId && typeof flowId === "string") {
			const newId = uuidv4();
			setMomentId(newId);
			const createMoment = async () => {
				const { data, error } = await supabase.from("moments").insert({
					id: newId,
					flow_id: flowId,
					title: "",
					content: "",
				});
				if (error) console.error("❌ Failed to create moment:", error);
			};
			createMoment();
		}
	}, [flowId, momentId]);

	// Save moment to Supabase
	const saveMoment = async (updatedTitle: string, updatedContent: string) => {
		if (!momentId) return;
		setIsSaving(true);
		const { data, error } = await supabase
			.from("moments")
			.update({
				title: updatedTitle,
				content: updatedContent,
				updated_at: new Date().toISOString(),
			})
			.eq("id", momentId);
		if (error) {
			console.error("❌ Error saving moment:", error);
		}
		setIsSaving(false);
	};

	// Debounced version
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
							<CustomBreadcrumb 
								flowId={flow?.id} 
								flowTitle={flow?.title} 
								momentId={momentId} 
								momentTitle={title}
								isLoading={isLoadingFlow}
							/>
						</div>
						<div className='flex flex-1 flex-col gap-4 overflow-y-auto pr-3'>
							<input
								type='text'
								placeholder='Your moment title...'
								className='text-2xl font-semibold w-full focus:outline-none'
								value={title}
								onChange={handleTitleChange}
							/>
							<textarea
								placeholder='Start writing your thoughts...'
								className='text-base min-h-[300px] w-full resize-none focus:outline-none'
								value={content}
								onChange={handleContentChange}
							/>
							<p className='text-sm text-gray-500'>
								{isSaving ? "Saving..." : "All changes saved."}
							</p>
						</div>
					</div>
					<BottomControls />
				</div>
			</div>
		</div>
	);
};

export default NewMoment;