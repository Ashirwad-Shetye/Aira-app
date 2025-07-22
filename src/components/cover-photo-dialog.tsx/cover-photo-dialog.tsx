// components/cover-photo-dialog.tsx
"use client";

import {
	Dialog,
	DialogHeader,
	DialogTitle,
	DialogContent,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Cropper from "react-easy-crop";
import Dropzone from "react-dropzone";
import { supabaseAdmin, supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useImageCrop } from "@/hooks/use-image-crop";
import getBlurhashFromImage from "@/lib/blurhash-from-image";
import { useState } from "react";
import Icons from "../ui/icons";

export default function CoverPhotoDialog({
	open,
	onOpenChange,
	flowId,
	onCoverUpdated,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	flowId: string;
	onCoverUpdated: (url: string, blurhash: string) => void;
    } ) {
    const [isSaving, setIsSaving] = useState<boolean>(false);
	const {
		imageSrc,
		croppedImage,
		crop,
		zoom,
		setCrop,
		setZoom,
		onCropComplete,
		handleFileDrop,
		getCroppedImage,
		maxZoom,
		minZoom,
		reset,
	} = useImageCrop();


    const handleSave = async () => {
        if (!croppedImage) {
            toast.error("No cropped image available");
            return;
        }

        setIsSaving(true); // Start loading

        const fileName = `${flowId}-${Date.now()}.jpeg`;

        try {
            // Step 1: Fetch old photo
            const { data: existingFlow } = await supabase
                .from("flows")
                .select("cover_photo_url")
                .eq("id", flowId)
                .single();
            const oldUrl = existingFlow?.cover_photo_url;

            // Step 2: Upload
            const { data: upload, error: uploadError } = await supabaseAdmin.storage
                .from("flow-cover-photos")
                .upload(fileName, croppedImage, {
                    contentType: "image/jpeg",
                    upsert: true,
                });
            if (uploadError) throw new Error("Upload failed");

            // Step 3: Get URL
            const url = supabaseAdmin.storage
                .from("flow-cover-photos")
                .getPublicUrl(fileName).data.publicUrl;

            // Step 4: Blurhash
            const blurhash = await getBlurhashFromImage(croppedImage);

            // Step 5: DB update
            const { error: dbError } = await supabase
                .from("flows")
                .update({
                    cover_photo_url: url,
                    cover_photo_blurhash: blurhash,
                })
                .eq("id", flowId);
            if (dbError) throw new Error("Failed to update database");

            // Step 6: Delete old
            if (oldUrl) {
                const oldFileName = oldUrl.split("/").pop();
                await supabaseAdmin.storage
                    .from("flow-cover-photos")
                    .remove([oldFileName]);
            }

            toast.success("Cover updated");
            onCoverUpdated(url, blurhash);
            onOpenChange(false);
        } catch (err: any) {
            toast.error(err.message || "Something went wrong");
        } finally {
            setIsSaving( false ); // End loading
            handleReset()
        }
    };

	const handleCancel = () => {
		reset();
		onOpenChange(false);
    };
    
    const handleReset = async () => {
        const { data: existingFlow, error: fetchError } = await supabase
            .from("flows")
            .select("cover_photo_url")
            .eq("id", flowId)
            .single();

        if (fetchError || !existingFlow?.cover_photo_url) {
            toast.error("No cover photo to reset.");
            return;
        }

        const segments = existingFlow.cover_photo_url.split("/");
        const fileName = segments[segments.length - 1];

        const { error: deleteError } = await supabaseAdmin.storage
            .from("flow-cover-photos")
            .remove([fileName]);

        if (deleteError) {
            toast.error("Failed to delete image");
            return;
        }

        const { error: updateError } = await supabase
            .from("flows")
            .update({
                cover_photo_url: null,
                cover_photo_blurhash: null,
            })
            .eq("id", flowId);

        if (updateError) {
            toast.error("Failed to reset cover photo");
            return;
        }

        toast.success("Cover photo reset to default");
        onCoverUpdated("", "");
        onOpenChange(false);
    };

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) {
					reset();
				}
				onOpenChange(isOpen);
			}}
		>
			<DialogContent className='max-w-xl'>
				<DialogHeader>
					<DialogTitle>Update Cover Photo</DialogTitle>
				</DialogHeader>

				{!imageSrc ? (
					<Dropzone
						accept={{ "image/*": [] }}
						maxSize={2 * 1024 * 1024}
						multiple={false}
						onDrop={handleFileDrop}
						onDropRejected={(fileRejections) => {
							fileRejections.forEach((rejection) => {
								if (
									rejection.errors.some(
										(error) => error.code === "file-too-large"
									)
								) {
									toast.error("File is too large. Maximum size is 2MB.");
								} else {
									toast.error("Invalid file type. Please upload an image.");
								}
							});
						}}
					>
						{({ getRootProps, getInputProps }) => (
							<div
								{...getRootProps()}
								className='border rounded-lg p-6 text-center cursor-pointer bg-gray-50'
							>
								<input {...getInputProps()} />
								<p>Click or drag a photo here (max 2MB)</p>
							</div>
						)}
					</Dropzone>
				) : (
					<div className='relative w-full h-64 bg-muted rounded-md overflow-hidden'>
						<Cropper
							image={imageSrc}
							crop={crop}
							zoom={zoom}
							aspect={4 / 1}
							minZoom={minZoom}
							maxZoom={maxZoom}
							onCropChange={setCrop}
							onZoomChange={setZoom}
							onCropComplete={onCropComplete}
							restrictPosition={true} // Restrict crop to image boundaries
						/>
					</div>
				)}

				<DialogFooter>
					{isSaving ? (
						<div className='w-full flex items-center justify-center py-5'>
							<Icons.loader className='h-5 w-5 animate-spin text-muted-foreground' />
						</div>
					) : (
						<div className='flex items-center justify-between w-full'>
							<Button
								variant='ghost'
								onClick={handleReset}
							>
								Remove banner
							</Button>
							<div className='flex items-center gap-5'>
								<Button
									variant='ghost'
									onClick={handleCancel}
								>
									Cancel
								</Button>
								<Button
									disabled={!croppedImage}
									onClick={handleSave}
								>
									Save
								</Button>
							</div>
						</div>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
