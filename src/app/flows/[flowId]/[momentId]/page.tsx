 "use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
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

export default function MomentEditorPage() {
	const { flowId, momentId } = useParams();
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const editorRef = useRef<any>(null);
	const [flowTitle, setFlowTitle] = useState("");
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [isFlowLoading, setIsFlowLoading] = useState(true);
	const [isMomentLoading, setIsMomentLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch flow
	useEffect(() => {
		if (!flowId || typeof flowId !== "string") return;
		const fetchFlow = async () => {
			setIsFlowLoading(true);
			const { data, error } = await supabase
				.from("flows")
				.select("title")
				.eq("id", flowId)
				.single();
			if (error || !data) {
				console.error("❌ Flow load error:", error);
				setError("Failed to load flow.");
			} else {
				setFlowTitle(data.title);
			}
			setIsFlowLoading(false);
		};
		fetchFlow();
	}, [flowId]);

	// Fetch moment
	useEffect(() => {
		if (!momentId || typeof momentId !== "string") return;
		const fetchMoment = async () => {
			setIsMomentLoading(true);
			const { data, error } = await supabase
				.from("moments")
				.select("title, content")
				.eq("id", momentId)
				.single();
			if (error || !data) {
				console.error("❌ Moment load error:", error);
				setError("Failed to load moment.");
			} else {
				setTitle(data.title || "");
				setContent(data.content || "");
			}
			setIsMomentLoading(false);
		};
		fetchMoment();
	}, [ momentId ] );
	
	const debouncedOnText = useCallback(
		debounce((text: string) => {
			if (editorRef.current) {
				editorRef.current.commands.focus();
				editorRef.current.commands.insertContent(text + " ");
			}
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
		setIsSaving( true );
		const cleanSnippet = generateSnippet(updatedContent)
		const { error } = await supabase
			.from("moments")
			.update({
				title: updatedTitle,
				content: updatedContent,
				snippet: cleanSnippet,
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

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const isMac = navigator.platform.toUpperCase().includes("MAC");
			if (
				(isMac && e.metaKey && e.key === "s") ||
				(!isMac && e.ctrlKey && e.key === "s")
			) {
				e.preventDefault();
				saveMoment(title, content);
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [title, content, momentId]);

	if (error) {
		return (
			<div className='p-5 text-red-600 text-center'>
				<p>{error}</p>
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
				<div className='px-5 flex items-center gap-5 relative overflow-hidden min-w-0'>
					<BackButton />
					<CustomBreadcrumb
						flowId={flowId as string}
						flowTitle={flowTitle}
						momentId={momentId as string}
						momentTitle={title}
						isLoading={isFlowLoading || isMomentLoading}
					/>
				</div>
				<div className='flex-1 flex flex-col sm:w-full md:w-[80%] max-w-7xl mx-auto min-h-0 px-5'>
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
								placeholder='Your moment title...'
								maxLength={300}
							/>
							<div className='flex-1 flex flex-col relative min-h-0'>
								<MomentEditor
									initialContent={content}
									onChange={(html) => {
										setContent(html);
										debouncedSave(title, html);
									}}
									editorRef={editorRef}
								/>
							</div>
						</>
					)}
				</div>
			</div>
			<div className='flex justify-center items-center px-10 pb-5 gap-4'>
				{voiceError && (
					<div className='flex items-center gap-2 text-red-500 text-sm'>
						<p>{voiceError}</p>
						<button
							onClick={() => setError(null)}
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
			<BottomControls
				status={true}
				isSaving={isSaving}
			/>
		</ScrollableHeaderLayout>
	);
}
