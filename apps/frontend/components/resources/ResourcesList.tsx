import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { Resource } from "@ucaptcha/shared";
import { EmptyState } from "@/components/shared/EmptyState";

interface ResourceWithSite extends Resource {
    siteName: string;
}

interface ResourcesListProps {
    resources: ResourceWithSite[];
    selectedSiteId?: number;
    onEdit: (resource: ResourceWithSite) => void;
    onDelete: (resource: ResourceWithSite) => void;
}

export function ResourcesList({ resources, selectedSiteId, onEdit, onDelete }: ResourcesListProps) {
    if (resources.length === 0 && !selectedSiteId) {
        return <EmptyState title="No Resources" description="Create your first resource to get started." />;
    } else if (resources.length === 0) {
        return <EmptyState title="No Resources Found" description="Please try changing the filter." />;
    }

    return (
        <div className="mt-6 grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {resources.map((resource) => (
                <Card key={resource.id}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>{resource.name}</CardTitle>
                                <CardDescription className="mt-2">
                                    Site: {resource.siteName}
                                    <br />
                                    Created: {new Date(resource.createdAt).toLocaleDateString()}
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => onEdit(resource)}>
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => onDelete(resource)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            ))}
        </div>
    );
}
