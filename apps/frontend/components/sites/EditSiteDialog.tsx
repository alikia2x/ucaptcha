"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditSiteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	siteName: string;
	onSiteNameChange: (name: string) => void;
	onUpdate: () => void;
	isLoading: boolean;
}

export function EditSiteDialog({
	open,
	onOpenChange,
	siteName,
	onSiteNameChange,
	onUpdate,
	isLoading,
}: EditSiteDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Site</DialogTitle>
					<DialogDescription>Update your site information</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<div>
						<Label className="mb-2" htmlFor="editSiteName">
							Site Name
						</Label>
						<Input
							id="editSiteName"
							value={siteName}
							onChange={(e) => onSiteNameChange(e.target.value)}
							placeholder="Enter site name"
						/>
					</div>
				</div>
				<DialogFooter>
					<Button
						onClick={onUpdate}
						disabled={!siteName.trim() || isLoading}
					>
						Update Site
					</Button>
					<Button
						variant="outline"
						onClick={() => {
							onOpenChange(false);
							onSiteNameChange("");
						}}
					>
						Cancel
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
