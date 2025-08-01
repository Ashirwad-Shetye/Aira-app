 "use client";

import { useEffect, useRef, useState } from "react";
import BottomControls from "@/components/bottom-controls/bottom-controls";
import { NewFlowDialog } from "@/components/new-flow-dialog/new-flow-dialog";
import TagsBar from "@/components/tags-bar/tags-bar";
import Icons from "@/components/ui/icons";
import { useSession } from "next-auth/react";
import { Flow } from "@/types/flows";
import { supabase, supabaseAdmin } from "@/lib/supabase/client";
import FlowCard from "@/components/flow/flow-card";
import ScrollableHeaderLayout from "@/components/layouts/scrollable-header-layout";
import HeaderNavbar from "@/components/header-navbar/header-navbar";
import { ConfirmDialog } from "@/components/custom-alert-dialog/confirm-dialog";
import { toast } from "sonner";
import { SortByComboBox } from "@/components/combo-box/sort-by-combo-box";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MemberEntry } from "@/components/member-input/member-input";

const Flows = () => {
	const [flows, setFlows] = useState<Flow[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { data: session, status } = useSession();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editFlow, setEditFlow] = useState<Flow | null>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
	const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
	const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
	const [sortByValue, setSortByValue] = useState("last edited");
	const [allTags, setAllTags] = useState<string[]>([]);
	const [activeTag, setActiveTag] = useState<string | null>(null);
	const hasFetchedTagsRef = useRef(false);

	const fetchAllTags = async () => {
		if (status !== "authenticated" || !session?.user?.id) return;
		try {
			const { data, error } = await supabase.rpc("get_user_flow_tags", {
				user_id_input: session.user.id,
			});
			if (error) {
				console.error("Error fetching tags:", error.message);
			} else {
				setAllTags(data ?? []);
			}
		} catch (error: any) {
			console.error("Error fetching tags:", error.message);
		}
	};

	const fetchFlows = async () => {
		setIsLoading(true);
		setError(null);

		try {
			let column = "last_activity";
			let ascending = false;

			switch (sortByValue) {
				case "last created":
					column = "created_at";
					break;
				case "last edited":
					column = "last_activity";
					break;
				case "oldest created":
					column = "created_at";
					ascending = true;
					break;
				case "oldest edited":
					column = "last_activity";
					ascending = true;
					break;
			}

			const [personalFlowsRes, sharedFlowsRes] = await Promise.all([
				supabase.rpc("get_flows_with_moment_data", {
					user_id_input: session?.user.id,
				}),
				supabase.rpc("get_shared_flows_with_moment_data", {
					user_id_input: session?.user.id,
				}),
			] );
			console.log("Calling RPC with user ID:", session?.user?.id);
			
			console.log(personalFlowsRes.data);
			console.log(sharedFlowsRes.data);

			if (personalFlowsRes.error || sharedFlowsRes.error) {
				throw new Error(
					`Error fetching flows: ${personalFlowsRes.error?.message ?? ""} ${
						sharedFlowsRes.error?.message ?? ""
					}`
				);
			}

			const personalFlows = (personalFlowsRes.data ?? []).map((f: Flow) => ({
				...f,
				type: "personal",
			}));

			const sharedFlows = (sharedFlowsRes.data ?? []).map((f: Flow) => ({
				...f,
				type: f.type ?? "shared",
			}));

			const combined = [...personalFlows, ...sharedFlows];

			const sorted = combined.sort((a, b) => {
				const aDate = new Date(a[column] ?? a.created_at).getTime();
				const bDate = new Date(b[column] ?? b.created_at).getTime();
				return ascending ? aDate - bDate : bDate - aDate;
			});

			setFlows(sorted);
		} catch (error: any) {
			console.error(error);
			setError(error.message);
		} finally {
			setIsLoading(false);
		}
	};

	const hasFetchedRef = useRef(false);

	useEffect(() => {
		if (
			status === "authenticated" &&
			session?.user?.id &&
			!hasFetchedRef.current
		) {
			const fetchData = async () => {
				try {
					await Promise.all([fetchFlows(), fetchAllTags()]);
				} catch (error) {
					console.error(error);
				} finally {
					hasFetchedRef.current = true;
					hasFetchedTagsRef.current = true;
				}
			};
			fetchData();
		}
	}, [status, session]);

	useEffect(() => {
		if (hasFetchedRef.current) {
			fetchFlows();
		}
	}, [sortByValue]);

	const handleEditFlow = (flow: Flow) => {
		setEditFlow(flow);
		setDialogOpen(true);
	};

	const handleDeleteFlow = (flowId: string) => {
		const flow = flows.find((f) => f.id === flowId);
		if (!flow) return;
		setSelectedFlow(flow);
		setConfirmDialogOpen(true);
	};

	const confirmDelete = async () => {
		if (!selectedFlow) return;

		setDeletingIds((prev) => new Set(prev).add(selectedFlow.id));

		try {
			const coverUrl = selectedFlow.cover_photo_url;
			if (coverUrl) {
				const filePath = coverUrl.split("/flow-cover-photos/")[1];
				if (filePath) {
					const { error: storageError } = await supabaseAdmin.storage
						.from("flow-cover-photos")
						.remove([filePath]);

					if (storageError) {
						console.warn(
							"⚠️ Failed to delete cover photo:",
							storageError.message
						);
					}
				}
			}

			const { error } = await supabase
				.from("flows")
				.delete()
				.eq("id", selectedFlow.id);

			if (error) {
				toast.error("Failed to delete flow.");
				setError(error.message);
			} else {
				setFlows((prev) => prev.filter((f) => f.id !== selectedFlow.id));
				toast.success("Flow deleted successfully.");
			}
		} catch (err: any) {
			console.error("❌ Error during flow deletion:", err.message);
			toast.error("An unexpected error occurred.");
		} finally {
			setDeletingIds((prev) => {
				const next = new Set(prev);
				next.delete(selectedFlow.id);
				return next;
			});
			setConfirmDialogOpen(false);
			setSelectedFlow(null);
		}
	};

	const handleSaveFlow = async(data: {
		id?: string;
		title: string;
		bio?: string;
		tags?: string[];
		memberIds?: MemberEntry[];
		inviteEmails?: string[];
		type?: "personal" | "shared" | "couple";
	}) => {
		if (!data.id || !session?.user?.id) return;

		setIsLoading(true);
		setError(null);

		try {
			if (data.type === "personal") {
				// Update personal flow
				const { error } = await supabase
					.from("flows")
					.update({
						title: data.title,
						bio: data.bio ?? "",
						tags: data.tags ?? [],
						updated_at: new Date().toISOString(),
					})
					.eq("id", data.id)
					.eq("user_id", session.user.id);

				if (error) {
					console.error("❌ Error updating personal flow:", error);
					setError(error.message);
					toast.error("Failed to update personal flow.");
					return;
				}
			} else {
				// Update shared flow
				const { error: flowError } = await supabase
					.from("shared_flows")
					.update({
						title: data.title,
						bio: data.bio ?? "",
						tags: data.tags ?? [],
						updated_at: new Date().toISOString(),
					})
					.eq("id", data.id)
					.eq("user_id", session.user.id); // make sure ownership is checked

				if (flowError) {
					console.error("❌ Error updating shared flow:", flowError);
					setError(flowError.message);
					toast.error("Failed to update shared flow.");
					return;
				}

				// ➤ Fetch existing participants
				const { data: existingParticipants, error: fetchParticipantsError } =
					await supabase
						.from("shared_flow_participants")
						.select("user_id, email, role")
						.eq("flow_id", data.id);

				if (fetchParticipantsError) {
					console.error(
						"⚠️ Failed to fetch existing participants:",
						fetchParticipantsError
					);
					toast.error("Failed to fetch existing participants.");
					return;
				}

				// ➤ Separate owner
				const existingOwnerId = existingParticipants.find(
					(p) => p.role === "owner"
				)?.user_id;

				// ➤ Clean inputs
				const memberEntries = data.memberIds ?? [];
				const inviteEmails = data.inviteEmails ?? [];

				const existingUserIds = existingParticipants
					.filter((p) => p.user_id && p.role !== "owner")
					.map((p) => p.user_id as string);

				const existingEmails = existingParticipants
					.filter((p) => p.email)
					.map((p) => p.email as string);

				const newMemberIds = memberEntries.filter(
					(m) =>
						m.id !== existingOwnerId && !existingUserIds.includes(m.id ?? "")
				);

				const newInviteEmails = inviteEmails.filter(
					(email) => !existingEmails.includes(email)
				);

				const removedUserIds = existingUserIds.filter(
					(uid) => !memberEntries.some((m) => m.id === uid)
				);

				const removedEmails = existingEmails.filter(
					(email) => !inviteEmails.includes(email)
				);

				// ➤ Delete removed participants
				if (removedUserIds.length > 0) {
					const { error: deleteUsersError } = await supabase
						.from("shared_flow_participants")
						.delete()
						.eq("flow_id", data.id)
						.in("user_id", removedUserIds);

					if (deleteUsersError) {
						console.error(
							"⚠️ Failed to remove participants:",
							deleteUsersError
						);
						toast.error("Failed to remove some participants.");
					}
				}

				if (removedEmails.length > 0) {
					const { error: deleteEmailsError } = await supabase
						.from("shared_flow_participants")
						.delete()
						.eq("flow_id", data.id)
						.in("email", removedEmails);

					if (deleteEmailsError) {
						console.error(
							"⚠️ Failed to remove invite emails:",
							deleteEmailsError
						);
						toast.error("Failed to remove some email invites.");
					}
				}

				// ➤ Insert new participants
				const newRows = [
					...newMemberIds.map((m) => ({
						flow_id: data.id,
						user_id: m.id,
						email: m.email,
						role: "pending",
					})),
					...newInviteEmails.map((email) => ({
						flow_id: data.id,
						email,
						role: "pending",
					})),
				];

				if (newRows.length > 0) {
					const { error: insertError } = await supabase
						.from("shared_flow_participants")
						.insert(newRows);

					if (insertError) {
						console.error("⚠️ Failed to add new participants:", insertError);
						toast.error("Failed to add new participants.");
					}
				}
			}

			toast.success("Flow updated successfully.");
			setDialogOpen(false);
			setEditFlow(null);
			hasFetchedTagsRef.current = false;
			await fetchAllTags();
		} catch (err: any) {
			console.error("❌ Error during flow update:", err.message);
			setError(err.message);
			toast.error("An unexpected error occurred.");
		} finally {
			setIsLoading(false);
		}
	}

	const latestActivityTimestamp = flows.reduce(
		(latest: string | null, flow) => {
			if (!latest) return flow.last_activity ?? null;
			if (!flow.last_activity) return latest;
			return new Date(flow.last_activity) > new Date(latest)
				? flow.last_activity
				: latest;
		},
		null
	);

	return (
		<ScrollableHeaderLayout
			header={<HeaderNavbar />}
			scrollContainerRef={scrollContainerRef}
		>
			<div
				ref={scrollContainerRef}
				className='flex-1 flex flex-col gap-10 pb-10 min-h-screen overflow-y-auto p-5'
			>
				<div className='flex flex-col sm:w-full md:w-[80%] max-w-7xl mx-auto min-h-0 px-5'>
					<h1 className='font-libre font-semibold text-2xl'>Your Flows</h1>
					<div className='flex-1 flex flex-col'>
						<div className='sticky -top-5 z-40 w-full'>
							<div className='h-6 w-full bg-white' />
							<div className='w-full bg-white'>
								<div className='flex items-center bg-white rounded-full gap-2 border w-[40%] min-w-80 px-3 py-1.5'>
									<Icons.search />
									<input
										type='text'
										placeholder='Search your flows'
										className='text-gray-800 w-full font-cabin focus:ring-0 outline-none'
									/>
								</div>
							</div>
							<div className='h-6 w-full bg-white' />
						</div>
						<div className='sticky top-14 z-40 w-full'>
							<TagsBar
								tags={allTags}
								activeTag={activeTag}
								onTagSelect={(tag) => setActiveTag(tag)}
							/>
							<div className='bg-white w-full flex items-center py-5 justify-between'>
								<NewFlowDialog
									open={dialogOpen}
									onOpenChange={(open) => {
										setDialogOpen(open);
										if (!open) setEditFlow(null);
									}}
									flow={editFlow ?? undefined}
									onSave={editFlow ? handleSaveFlow : undefined}
									children={
										<Button
											variant='primary'
											className='group cursor-pointer select-none flex items-center justify-center'
										>
											<div className='gap-2 flex items-center justify-center'>
												<Icons.flow />
												<h1>{editFlow ? "Edit flow" : "Start a new flow"}</h1>
											</div>
										</Button>
									}
								/>
								<div>
									<SortByComboBox
										value={sortByValue}
										setValue={setSortByValue}
									/>
								</div>
							</div>
							<div className='h-6 w-full bg-gradient-to-t from-transparent via-white/90 to-white' />
						</div>
						{isLoading ? (
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10'>
								{Array.from({ length: 4 }).map((_, i) => (
									<div
										key={i}
										className='h-80 bg-gray-100 animate-pulse'
									/>
								))}
							</div>
						) : (
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10'>
								{flows.length === 0 ? (
									<Card
										onClick={() => setDialogOpen(!dialogOpen)}
										className='bg-muted col-span-1 md:col-span-2 lg:col-span-3 cursor-pointer'
									>
										<CardContent className='flex flex-col items-center justify-center h-32 text-muted-foreground p-6'>
											<Icons.flow className='h-8 w-8 mb-2 text-muted-foreground/50' />
											<p aria-live='polite'>
												No flows found. Create one to get started!
											</p>
										</CardContent>
									</Card>
								) : (
									flows
										.filter((flow) =>
											activeTag ? flow.tags?.includes(activeTag) : true
										)
										.map((flow, idx) => (
											<FlowCard
												key={`${flow.id}_${idx}`}
												flow={flow}
												latestFlow={
													flow.last_activity === latestActivityTimestamp
												}
												onEdit={handleEditFlow}
												onDelete={handleDeleteFlow}
												onRefreshFlows={fetchFlows}
											/>
										))
								)}
							</div>
						)}
					</div>
				</div>
			</div>
			<BottomControls />
			<ConfirmDialog
				open={confirmDialogOpen}
				onOpenChange={setConfirmDialogOpen}
				title='Delete this flow?'
				description='Deleting this flow will permanently remove it along with all its moments. This action cannot be undone.'
				confirmText='Delete'
				onConfirm={confirmDelete}
			/>
		</ScrollableHeaderLayout>
	);
};

export default Flows;
