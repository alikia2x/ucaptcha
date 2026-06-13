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

interface DeleteEntityDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** The display name of the entity being deleted, shown in the confirmation message */
	entityName: string;
	/** The type label, e.g. "site", "resource", "difficulty configuration" */
	entityType: string;
	onDelete: () => void;
	isLoading?: boolean;
}

export function DeleteEntityDialog({
	open,
	onOpenChange,
	entityName,
	entityType,
	onDelete,
	isLoading = false,
}: DeleteEntityDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete the {entityType}{" "}
						"{entityName}" and remove all associated data.
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
