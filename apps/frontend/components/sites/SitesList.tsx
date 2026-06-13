"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Trash2, Copy, Check } from "lucide-react";
import type { Site } from "@ucaptcha/shared";
import { EmptyState } from "@/components/shared/EmptyState";

interface SitesListProps {
    sites: Site[];
    copiedKey: string | null;
    onEdit: (site: Site) => void;
    onDelete: (site: Site) => void;
    onCopy: (key: string) => void;
}

function CopyButton({
    siteKey,
    copiedKey,
    onCopy,
}: {
    siteKey: string;
    copiedKey: string | null;
    onCopy: (key: string) => void;
}) {
    const isCopied = copiedKey === siteKey;

    return (
        <Button variant="outline" size="sm" onClick={() => onCopy(siteKey)}>
            {isCopied && <Check className="w-4 h-4" />}
            {!isCopied && <Copy className="w-4 h-4" />}
        </Button>
    );
}

export function SitesList({ sites, copiedKey, onEdit, onDelete, onCopy }: SitesListProps) {
    if (sites.length === 0) {
        return <EmptyState title="No Sites" description="Create your first site to get started." />;
    }

    return (
        <div className="mt-6 grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {sites.map((site) => (
                <Card key={site.id}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>{site.name}</CardTitle>
                                <CardDescription>
                                    Created: {new Date(site.createdAt).toLocaleDateString()}
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => onEdit(site)}>
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => onDelete(site)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div>
                                <Label className="mb-2" htmlFor={`siteKey-${site.id}`}>
                                    Site Key
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id={`siteKey-${site.id}`}
                                        value={site.siteKey}
                                        readOnly
                                        className="font-mono text-sm"
                                    />
                                    <CopyButton siteKey={site.siteKey} copiedKey={copiedKey} onCopy={onCopy} />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
