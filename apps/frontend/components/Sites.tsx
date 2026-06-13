"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Site } from "@ucaptcha/shared";
import {
	createSiteAction,
	updateSiteAction,
	deleteSiteAction,
} from "@/app/(dashboard)/sites/actions";
import { SitesList } from "./sites/SitesList";
import { CreateSiteDialog } from "./sites/CreateSiteDialog";
import { EditSiteDialog } from "./sites/EditSiteDialog";
import { DeleteEntityDialog } from "./shared/DeleteEntityDialog";

interface SitesProps {
	initialSites: Site[];
	userID: number;
}

export default function Sites({ initialSites, userID }: SitesProps) {
	const [sites, _setSites] = useState<Site[]>(initialSites);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [editingSite, setEditingSite] = useState<Site | null>(null);
	const [newSiteName, setNewSiteName] = useState("");
	const [copiedKey, setCopiedKey] = useState<string | null>(null);
	const [siteToDelete, setSiteToDelete] = useState<Site | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleCreateSite = async () => {
		if (!newSiteName.trim()) return;

		setIsLoading(true);
		try {
			const formData = new FormData();
			formData.append("name", newSiteName);

			await createSiteAction(userID, formData);

			// Refresh the page to get updated data
			router.refresh();
			setNewSiteName("");
			setShowCreateForm(false);
		} catch (error) {
			console.error("Error creating site:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleUpdateSite = async () => {
		if (!editingSite || !newSiteName.trim()) return;

		setIsLoading(true);
		try {
			const formData = new FormData();
			formData.append("id", editingSite.id.toString());
			formData.append("name", newSiteName);

			await updateSiteAction(userID, formData);

			// Refresh the page to get updated data
			router.refresh();
			setNewSiteName("");
			setEditingSite(null);
		} catch (error) {
			console.error("Error updating site:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteSite = async () => {
		if (!siteToDelete) return;

		setIsLoading(true);
		try {
			const formData = new FormData();
			formData.append("id", siteToDelete.id.toString());

			await deleteSiteAction(userID, formData);

			// Refresh the page to get updated data
			router.refresh();
			setSiteToDelete(null);
		} catch (error) {
			console.error("Error deleting site:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopiedKey(text);
			setTimeout(() => setCopiedKey(null), 2000);
		} catch (error) {
			console.error("Error copying to clipboard:", error);
		}
	};

	const handleEditSite = (site: Site) => {
		setEditingSite(site);
		setNewSiteName(site.name);
		setShowCreateForm(false);
	};

	return (
		<div className="font-sans">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold mt-4 ml-1">Sites</h1>
				<Button onClick={() => setShowCreateForm(true)} disabled={isLoading}>
					<Plus className="w-4 h-4 mr-2" />
					Add Site
				</Button>
			</div>

			<CreateSiteDialog
				open={showCreateForm}
				onOpenChange={setShowCreateForm}
				siteName={newSiteName}
				onSiteNameChange={setNewSiteName}
				onCreate={handleCreateSite}
				isLoading={isLoading}
			/>

			<EditSiteDialog
				open={!!editingSite}
				onOpenChange={(open: boolean) => !open && setEditingSite(null)}
				siteName={newSiteName}
				onSiteNameChange={setNewSiteName}
				onUpdate={handleUpdateSite}
				isLoading={isLoading}
			/>

			<SitesList
				sites={sites}
				copiedKey={copiedKey}
				onEdit={handleEditSite}
				onDelete={setSiteToDelete}
				onCopy={copyToClipboard}
			/>

			<DeleteEntityDialog
				open={!!siteToDelete}
				onOpenChange={(open: boolean) => !open && setSiteToDelete(null)}
				entityName={siteToDelete?.name ?? ""}
				entityType="site"
				onDelete={handleDeleteSite}
				isLoading={isLoading}
			/>
		</div>
	);
}
