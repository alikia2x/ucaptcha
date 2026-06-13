"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Site } from "@ucaptcha/shared";

interface DeleteSiteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	site: Site | null;
	onDelete: () => void;
	isLoading: boolean;
}

export function DeleteSiteDialog({
	open,
	onOpenChange,
	site,
	onDelete,
	isLoading,
}: DeleteSiteDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete the site "
						{site?.name}" and remove all associated data.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={onDelete} disabled={isLoading}>
						Continue
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
