"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase/client";
import { Flow } from "@/types/flows";
import { Moment } from "@/types/moments";
import { Button } from "@/components/ui/button";
import Icons from "@/components/ui/icons";
import BottomControls from "@/components/bottom-controls/bottom-controls";
import HeaderNavbar from "@/components/header-navbar/header-navbar";
import ScrollableHeaderLayout from "@/components/layouts/scrollable-header-layout";
import CustomBreadcrumb from "@/components/custom-breadcrumb/custom-breadcrumb";
import MomentCard from "@/components/flow/moment-card";
import { RenameMomentDialog } from "@/components/moment-dialogs/rename-moment-dialog";
import { ConfirmDialog } from "@/components/custom-alert-dialog/confirm-dialog";
import { toast } from "sonner";
import { generateSnippet } from "@/lib/text-utils";
import { formatDate } from "@/lib/date-convertors";
import CoverPhotoDialog from "@/components/cover-photo-dialog.tsx/cover-photo-dialog";
import BlurhashCanvas from "@/lib/blurhash-utils";
import Image from "next/image";
import { SortByComboBox } from "@/components/combo-box/sort-by-combo-box";

export default function FlowIdPage() {
	const { flowId } = useParams();
	const router = useRouter();
	const { data: session, status } = useSession();

	const [flow, setFlow] = useState<Flow | null>(null);
	const [moments, setMoments] = useState<Moment[]>([]);
	const [flowLoading, setFlowLoading] = useState(true);
	const [momentsLoading, setMomentsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	const [renameDialogOpen, setRenameDialogOpen] = useState(false);
	const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
	const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);
	const [ deletingIds, setDeletingIds ] = useState<Set<string>>( new Set() );
	const [ coverDialogOpen, setCoverDialogOpen ] = useState<boolean>( false )
	const [sortByValue, setSortByValue] = useState("last edited");

	useEffect(() => {
		if (!flowId || typeof flowId !== "string") return;
		if (status !== "authenticated" || !session?.user?.id) return;

		const fetchFlow = async () => {
			setFlowLoading(true);
			try {
				const { data, error } = await supabase
					.from("flows")
					.select(
						"id, title, bio, created_at, user_id, cover_photo_url, cover_photo_blurhash"
					)
					.eq("id", flowId)
					.single();
				if (error || !data) throw error || new Error("Flow not found");
				setFlow(data);
			} catch (err: any) {
				console.error("\u274C Error loading flow:", err.message);
				setError("Failed to load flow.");
				toast.error("Failed to load flow.");
			} finally {
				setFlowLoading(false);
			}
		};

		fetchFlow();
	}, [flowId, status, session?.user?.id]);

	useEffect(() => {
		if (!flowId || typeof flowId !== "string" || !flow) return;

		const fetchMoments = async () => {
			setMomentsLoading(true);
			try {
				let column = "updated_at";
				let ascending = false;

				switch (sortByValue) {
					case "last created":
						column = "created_at";
						ascending = false;
						break;
					case "last edited":
						column = "updated_at";
						ascending = false;
						break;
					case "oldest created":
						column = "created_at";
						ascending = true;
						break;
					case "oldest edited":
						column = "updated_at";
						ascending = true;
						break;
					default:
						column = "updated_at";
						ascending = false;
				}

				const { data, error } = await supabase
					.from("moments")
					.select("id, flow_id, title, created_at, updated_at, snippet")
					.eq("flow_id", flowId)
					.order(column, { ascending });

				if (error) throw error;
				setMoments(data ?? []);
			} catch (err: any) {
				console.error("❌ Error loading moments:", err.message);
				toast.error("Failed to load moments.");
			} finally {
				setMomentsLoading(false);
			}
		};

		fetchMoments();
	}, [flowId, flow, sortByValue]);
	
	console.log(flow)

	const handleRename = (moment: Moment) => {
		setSelectedMoment(moment);
		setRenameDialogOpen(true);
	};

	const handleSaveRename = async (data: { id: string; title: string }) => {
		const { error } = await supabase
			.from("moments")
			.update({ title: data.title, updated_at: new Date().toISOString() })
			.eq("id", data.id);
		if (!error) {
			setMoments((prev) =>
				prev.map((m) =>
					m.id === data.id
						? { ...m, title: data.title, updated_at: new Date().toISOString() }
						: m
				)
			);
			toast.success("Moment renamed successfully.");
		} else {
			toast.error("Failed to rename moment.");
		}
		setRenameDialogOpen(false);
	};

	const handleDelete = (moment: Moment) => {
		setSelectedMoment(moment);
		setConfirmDialogOpen(true);
	};

	const confirmDelete = async () => {
		if (!selectedMoment) return;

		setDeletingIds((prev) => new Set(prev).add(selectedMoment.id));

		setTimeout(async () => {
			const { error } = await supabase
				.from("moments")
				.delete()
				.eq("id", selectedMoment.id);

			if (!error) {
				setMoments((prev) => prev.filter((m) => m.id !== selectedMoment.id));
				toast.success("Successfully deleted moment.");
			} else {
				toast.error("Failed to delete moment.");
			}

			setDeletingIds((prev) => {
				const next = new Set(prev);
				next.delete(selectedMoment.id);
				return next;
			});

			setConfirmDialogOpen(false);
			setSelectedMoment(null);
		}, 250);
	};

	const handleDuplicate = async (moment: Moment) => {
		if (!flowId || typeof flowId !== "string") return;

		const { data: originalMoment, error: fetchError } = await supabase
			.from("moments")
			.select("id, title, content")
			.eq("id", moment.id)
			.single();

		if (fetchError || !originalMoment) {
			console.error("❌ Failed to fetch moment content:", fetchError?.message);
			toast.error("Failed to duplicate moment.");
			return;
		}

		const duplicateTitle =
			(originalMoment.title || "Untitled Moment") + " (copy)";
		const duplicateContent = originalMoment.content || "";
		const duplicateSnippet = generateSnippet(duplicateContent);

		const { data: newMoment, error: insertError } = await supabase
			.from("moments")
			.insert([
				{
					title: duplicateTitle,
					content: duplicateContent,
					snippet: duplicateSnippet,
					flow_id: flowId,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				},
			])
			.select()
			.single();

		if (insertError || !newMoment) {
			console.error("❌ Failed to duplicate moment:", insertError?.message);
			toast.error("Failed to duplicate moment.");
			return;
		}

		setMoments((prev) => [newMoment, ...prev]);
		toast.success("Moment duplicated successfully.");
	};

	if (error) {
		return (
			<div className='p-5 flex flex-col items-center justify-center text-red-500 text-center'>
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
				className='flex-1 flex flex-col gap-10 pb-10 relative min-h-0 overflow-y-auto p-5'
			>
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
						flowTitle={flow?.title}
						isLoading={flowLoading}
					/>
				</div>

				<div className='flex-1 flex flex-col sm:w-full md:w-[70%] max-w-7xl mx-auto min-h-0 relative'>
					<div className='flex flex-col gap-3 relative w-full'>
						{flowLoading ? (
							<>
								<div className='h-40 w-full bg-gray-100 animate-pulse' />
								<div className='h-8 w-40 bg-gray-100 animate-pulse' />
								<div className='h-40 w-full bg-gray-100 animate-pulse' />
							</>
						) : !flow ? (
							<div className='flex items-center justify-center flex-1'>
								<h1 className='font-figtree font-semibold text-muted-foreground text-2xl'>
									The flow you are looking for does not exist!
								</h1>
							</div>
						) : (
							<div className='flex flex-col gap-3 relative w-full'>
								{flow.cover_photo_url ? (
									<div className='relative w-full aspect-[4/1] group overflow-hidden bg-muted/50 mb-5'>
										{flow.cover_photo_blurhash && (
											<BlurhashCanvas
												hash={flow.cover_photo_blurhash}
												width={32}
												height={8}
												punch={1}
											/>
										)}
										<Image
											src={flow.cover_photo_url}
											alt='Cover'
											className='w-full h-full object-cover transition-opacity duration-300 relative z-10'
											loading='lazy'
											onLoad={(e) => {
												e.currentTarget.style.opacity = "1";
											}}
											height={2000}
											width={2000}
											style={{
												opacity: flow.cover_photo_blurhash ? 0 : 1,
												position: "absolute",
												top: 0,
												left: 0,
											}}
											unoptimized
										/>
										<Button
											variant='secondary'
											className='hidden group-hover:block absolute top-5 right-5 z-50 opacity-0 group-hover:opacity-100 transition-all duration-300'
											onClick={() => setCoverDialogOpen(true)}
										>
											<Icons.pencil className='shrink-0' />
										</Button>
										<CoverPhotoDialog
											open={coverDialogOpen}
											onOpenChange={setCoverDialogOpen}
											flowId={flow.id}
											onCoverUpdated={(url, blurhash) => {
												setFlow((prev) =>
													prev
														? {
																...prev,
																cover_photo_url: url,
																cover_photo_blurhash: blurhash,
														  }
														: prev
												);
											}}
										/>
									</div>
								) : (
									<div className='relative w-full mb-5'>
										<Button
											variant='secondary'
											className='flex items-center gap-1'
											onClick={() => setCoverDialogOpen(true)}
										>
											<Icons.image className='shrink-0' />
											<p>Add cover</p>
										</Button>
										<CoverPhotoDialog
											open={coverDialogOpen}
											onOpenChange={setCoverDialogOpen}
											flowId={flow.id}
											bannerExist={false}
											onCoverUpdated={(url, blurhash) => {
												setFlow((prev) =>
													prev
														? {
																...prev,
																cover_photo_url: url,
																cover_photo_blurhash: blurhash,
														  }
														: prev
												);
											}}
										/>
									</div>
								)}
								<h1 className='font-libre font-semibold text-2xl'>
									{flow.title || "Untitled Flow"}
								</h1>
								{flow?.bio ? (
									<p className='text-muted-foreground'>{flow.bio}</p>
								) : (
									<p className='text-muted-foreground'>Add bio</p>
								)}
								<div>
									<p className='text-gray-500'>
										Created on: {formatDate(flow.created_at)}
									</p>
								</div>
							</div>
						)}
					</div>

					<div className='sticky -top-5 z-40 w-full'>
						<div className='h-6 w-full bg-white' />
						<div className='w-full bg-white'>
							<div className='flex items-center bg-white rounded-full gap-2 border w-[40%] min-w-80 px-3 py-1.5'>
								<Icons.search />
								<input
									type='text'
									placeholder='Search your moments'
									className='text-gray-800 w-full focus:ring-0 outline-none'
								/>
							</div>
						</div>
						<div className='bg-white w-full flex items-center justify-end'>
							<div>
								<SortByComboBox
									value={sortByValue}
									setValue={setSortByValue}
								/>
							</div>
						</div>
						<div className='h-6 w-full bg-gradient-to-t from-transparent via-white/90 to-white' />
					</div>

					{flow && momentsLoading ? (
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2'>
							{Array.from({ length: 6 }).map((_, i) => (
								<div
									key={i}
									className='h-32 bg-gray-100 animate-pulse'
								/>
							))}
						</div>
					) : flow && moments.length === 0 ? (
						<p className='text-muted-foreground mt-4'>
							No moments yet. Add your first one.
						</p>
					) : (
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2 pb-10'>
							{moments.map((moment) => (
								<MomentCard
									key={moment.id}
									moment={moment}
									flow={flow}
									onRename={handleRename}
									onDelete={handleDelete}
									onDuplicate={handleDuplicate}
									isDeleting={deletingIds.has(moment.id)}
									isNew={moment.id.startsWith("temp_")}
								/>
							))}
						</div>
					)}
				</div>
			</div>

			<BottomControls />

			<RenameMomentDialog
				moment={selectedMoment!}
				open={renameDialogOpen}
				onOpenChange={setRenameDialogOpen}
				onSave={handleSaveRename}
			/>
			<ConfirmDialog
				open={confirmDialogOpen}
				onOpenChange={setConfirmDialogOpen}
				title='Delete this moment?'
				description='This action cannot be undone.'
				confirmText='Delete'
				onConfirm={confirmDelete}
			/>
		</ScrollableHeaderLayout>
	);
}