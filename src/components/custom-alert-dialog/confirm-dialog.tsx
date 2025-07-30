 "use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title?: string;
	description?: string;
	cancelText?: string;
	confirmText?: string;
	onConfirm?: () => void;
}

export function ConfirmDialog({
	open,
	onOpenChange,
	title = "Are you sure?",
	description = "This action cannot be undone.",
	cancelText = "Cancel",
	confirmText = "Confirm",
	onConfirm,
}: ConfirmDialogProps) {
	return (
		<AlertDialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
				</AlertDialogHeader>
				<p className="text-sm text-muted-foreground">{description}</p>
				<AlertDialogFooter>
					<AlertDialogCancel>{cancelText}</AlertDialogCancel>
					<AlertDialogAction onClick={onConfirm}>
						{confirmText}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}