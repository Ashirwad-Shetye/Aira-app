"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import debounce from "lodash/debounce";
import BottomControls from "@/components/bottom-controls/bottom-controls";
import CustomBreadcrumb from "@/components/custom-breadcrumb/custom-breadcrumb";
import MomentEditor from "@/components/editor/moment-editor";
import HeaderNavbar from "@/components/header-navbar/header-navbar";
import BackButton from "@/components/ui/back-button";
import AutoResizingTitleTextarea from "@/components/editor/auto-resizing-title-textarea";
import ScrollableHeaderLayout from "@/components/layouts/scrollable-header-layout";
import { generateSnippet } from "@/lib/text-utils";
import { useVoiceTyping } from "@/hooks/use-voice-typing";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import AuthorCard from "@/components/ui/author-card";
import { formatDate } from "@/lib/date-convertors";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function MomentEditorPage() {
	const { flowId, momentId } = useParams();
	const searchParams = useSearchParams();
	const type = searchParams.get("type");
	const { data: session } = useSession();
	const queryClient = useQueryClient();

	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const editorRef = useRef<any>(null);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	const fetchFlow = async () => {
		const source =
			type === "shared" || type === "couple" ? "shared_flows" : "flows";
		const { data, error } = await supabase
			.from(source)
			.select("id, title")
			.eq("id", flowId)
			.maybeSingle();
		if (error || !data) throw error || new Error("Flow not found");
		return data.title;
	};

	const fetchMoment = async () => {
		if (!momentId || typeof momentId !== "string") return;
		if (type === "shared" || type === "couple") {
			const { data, error } = await supabase
				.from("shared_moments")
				.select(
					`title, content, user_id, updated_at, users(username, email, avatar_url)`
				)
				.eq("id", momentId)
				.single();

			if (error || !data) throw new Error("Shared moment not found");

			const isOtherUser = session?.user?.id !== data.user_id;

			if (isOtherUser) {
				setTimeout(() => {
					supabase.from("shared_moment_reads").upsert(
						{
							user_id: session?.user?.id,
							moment_id: momentId,
							read_at: new Date().toISOString(),
						},
						{ onConflict: "user_id, moment_id" }
					);
				}, 2000);
			}

			return {
				title: data.title || "",
				content: data.content || "",
				updated_at: data.updated_at,
				author: {
					user_id: data.user_id,
					...(data.users as unknown as {
						username: string;
						email: string;
						avatar_url?: string;
					}),
				},
			};
		} else {
			const { data, error } = await supabase
				.from("moments")
				.select("title, content, updated_at")
				.eq("id", momentId)
				.single();

			if (error || !data) throw new Error("Moment not found");

			return {
				title: data.title || "",
				content: data.content || "",
				updated_at: data.updated_at,
			};
		}
	};

	const {
		data: flowTitle,
		isLoading: isFlowLoading,
		error: flowError,
	} = useQuery({
		queryKey: ["flow", flowId, type],
		queryFn: fetchFlow,
		enabled: !!flowId,
	});

	const {
		data: momentData,
		isLoading: isMomentLoading,
		error: momentError,
	} = useQuery({
		queryKey: ["moment", momentId, type],
		queryFn: fetchMoment,
		enabled: !!momentId,
	});

	useEffect(() => {
		if (momentData) {
			setTitle(momentData.title);
			setContent(momentData.content);
		}
	}, [momentData]);

	const debouncedOnText = useCallback(
		debounce((text: string) => {
			editorRef.current?.commands.focus();
			editorRef.current?.commands.insertContent(text + " ");
		}, 200),
		[]
	);

	const {
		isListening,
		start,
		stop,
		error: voiceError,
	} = useVoiceTyping({
		onText: debouncedOnText,
	});

	const saveMoment = async (updatedTitle: string, updatedContent: string) => {
		setIsSaving(true);
		const cleanSnippet = generateSnippet(updatedContent);
		const updated_at = new Date().toISOString();
		const source =
			type === "shared" || type === "couple" ? "shared_moments" : "moments";

		const { error } = await supabase
			.from(source)
			.update({
				title: updatedTitle,
				content: updatedContent,
				snippet: cleanSnippet,
				updated_at,
			})
			.eq("id", momentId);

		if (error) toast.error("Failed to save moment.");
		queryClient.invalidateQueries({ queryKey: ["moment", momentId, type] });
		setIsSaving(false);
	};

	const debouncedSave = useCallback(
		debounce((t: string, c: string) => {
			saveMoment(t, c);
		}, 1500),
		[momentId]
	);

	const isEditable = !type || session?.user?.id === momentData?.author?.user_id;

	if (flowError || momentError) {
		return (
			<div className='p-5 text-red-600 text-center'>
				<p>Failed to load data.</p>
			</div>
		);
	}

	return (
		<ScrollableHeaderLayout
			header={<HeaderNavbar />}
			scrollContainerRef={scrollContainerRef}
		>
			<div
				ref={scrollContainerRef}
				className='flex-1 flex flex-col gap-10 pb-10 relative min-h-0 overflow-y-auto pt-5'
			>
				<div className='px-5 flex items-center gap-5'>
					<BackButton />
					<CustomBreadcrumb
						flowId={flowId as string}
						flowTitle={flowTitle}
						momentId={momentId as string}
						momentTitle={title}
						isLoading={isFlowLoading || isMomentLoading}
					/>
				</div>

				<div className='flex flex-col sm:w-full md:w-[80%] max-w-7xl mx-auto min-h-0 px-5'>
					{isMomentLoading ? (
						<>
							<div className='h-10 w-2/3 bg-gray-100 rounded mb-4 animate-pulse' />
							<div className='flex-1 bg-gray-100 rounded animate-pulse' />
						</>
					) : (
						<>
							<AutoResizingTitleTextarea
								value={title}
								onChange={(val) => {
									setTitle(val);
									debouncedSave(val, content);
								}}
								readOnly={!isEditable}
								placeholder='Your moment title...'
								maxLength={300}
							/>
							{!isEditable && momentData?.author && (
								<div className='px-10 w-fit flex items-center gap-5 pb-5'>
									<AuthorCard author={momentData.author} />
									<p className='text-muted-foreground text-sm'>
										Last Updated:{" "}
										{momentData.updated_at
											? formatDate(momentData.updated_at)
											: "N/A"}
									</p>
								</div>
							)}
							<div className='flex-1 flex flex-col relative min-h-0 border-t border-gray-200'>
								<MomentEditor
									initialContent={content}
									onChange={(html) => {
										setContent(html);
										debouncedSave(title, html);
									}}
									editorRef={editorRef}
									readOnly={!isEditable}
								/>
							</div>
						</>
					)}
				</div>
			</div>

			{isEditable && !isFlowLoading && (
				<div className='flex justify-center items-center px-10 pb-5 gap-4'>
					{voiceError && (
						<div className='flex items-center gap-2 text-red-500 text-sm'>
							<p>{voiceError}</p>
							<button
								onClick={() => toast.dismiss()}
								className='text-sm underline'
							>
								Dismiss
							</button>
						</div>
					)}
					<canvas
						id='waveform'
						width={300}
						height={60}
						className='rounded-md bg-white'
					></canvas>
					<button
						onClick={isListening ? stop : start}
						disabled={isMomentLoading || isFlowLoading}
						className={`px-4 py-2 rounded-md text-white font-medium ${
							isListening ? "bg-red-500" : "bg-green-600"
						} ${
							isMomentLoading || isFlowLoading
								? "opacity-50 cursor-not-allowed"
								: "hover:opacity-90"
						} transition`}
					>
						{isListening ? "Stop Voice Typing" : "Start Voice Typing"}
					</button>
				</div>
			)}

			<BottomControls
				status={isEditable}
				isSaving={isSaving}
			/>
		</ScrollableHeaderLayout>
	);
}
