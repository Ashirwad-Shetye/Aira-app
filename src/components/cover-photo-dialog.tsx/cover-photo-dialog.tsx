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
}) {
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

        const fileName = `${flowId}-${Date.now()}.jpeg`;

        // ⬇️ Step 1: Fetch existing flow to get old cover photo URL
        const { data: existingFlow, error: fetchError } = await supabase
            .from("flows")
            .select("cover_photo_url")
            .eq("id", flowId)
            .single();

        const oldUrl = existingFlow?.cover_photo_url;

        // ⬇️ Step 2: Upload new image
        const { data: upload, error: uploadError } = await supabaseAdmin.storage
            .from("flow-cover-photos")
            .upload(fileName, croppedImage, {
                contentType: "image/jpeg",
                upsert: true,
            });

        if (uploadError) {
            toast.error("Upload failed");
            return;
        }

        const url = supabaseAdmin.storage.from("flow-cover-photos").getPublicUrl(fileName)
            .data.publicUrl;

        // ⬇️ Step 3: Generate blurhash
        let blurhash: string;
        try {
            blurhash = await getBlurhashFromImage(croppedImage);
        } catch (error) {
            toast.error("Failed to generate blurhash");
            return;
        }

        // ⬇️ Step 4: Update database
        const { error: dbError } = await supabase
            .from("flows")
            .update({
                cover_photo_url: url,
                cover_photo_blurhash: blurhash,
            })
            .eq("id", flowId);

        if (dbError) {
            toast.error("Failed to update flow");
            return;
        }

        // ⬇️ Step 5: Delete old image from storage (if it existed)
        if (oldUrl) {
            const segments = oldUrl.split("/");
            const oldFileName = segments[segments.length - 1];

            const { error: deleteError } = await supabaseAdmin.storage
                .from("flow-cover-photos")
                .remove([oldFileName]);

            if (deleteError) {
                console.warn("⚠️ Failed to delete old cover photo:", deleteError.message);
            }
        }

        // ⬇️ Step 6: Notify and update local state
        toast.success("Cover updated");
        onCoverUpdated(url, blurhash);
        onOpenChange(false);
    };

	const handleCancel = () => {
		reset();
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
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
