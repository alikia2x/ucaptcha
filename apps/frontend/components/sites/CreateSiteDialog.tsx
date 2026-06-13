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

interface CreateSiteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	siteName: string;
	onSiteNameChange: (name: string) => void;
	onCreate: () => void;
	isLoading: boolean;
}

export function CreateSiteDialog({
	open,
	onOpenChange,
	siteName,
	onSiteNameChange,
	onCreate,
	isLoading,
}: CreateSiteDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Site</DialogTitle>
					<DialogDescription>Add a new site to manage</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<div>
						<Label className="mb-2" htmlFor="createSiteName">
							Site Name
						</Label>
						<Input
							id="createSiteName"
							value={siteName}
							onChange={(e) => onSiteNameChange(e.target.value)}
							placeholder="Enter site name"
						/>
					</div>
				</div>
				<DialogFooter>
					<Button
						onClick={onCreate}
						disabled={!siteName.trim() || isLoading}
					>
						Create Site
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
