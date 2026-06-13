"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { DifficultyConfigWithRelations } from "@ucaptcha/shared";
import { EmptyState } from "@/components/shared/EmptyState";

interface DifficultyListProps {
    difficultyConfigs: DifficultyConfigWithRelations[];
    selectedSiteId?: number;
    selectedSiteName?: string;
    onEdit: (config: DifficultyConfigWithRelations) => void;
    onDelete: (config: DifficultyConfigWithRelations) => void;
}

interface ConfigCardProps {
    title: string;
    config: DifficultyConfigWithRelations;
    onEdit: (config: DifficultyConfigWithRelations) => void;
    onDelete: (config: DifficultyConfigWithRelations) => void;
}

function DifficultyConfigCard({ title, config, onEdit, onDelete }: ConfigCardProps) {
    const { difficultyConfig } = config;

    return (
        <Card className="gap-0">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle>{title}</CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => onEdit(config)}>
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => onDelete(config)}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div>
                        <strong>Default Difficulty:</strong> {difficultyConfig?.default}
                    </div>
                    <div>
                        <strong>Custom Rules:</strong> {difficultyConfig?.custom.length ?? 0} rules
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

interface SiteSectionProps {
    siteName?: string;
    defaultConfig?: DifficultyConfigWithRelations;
    resourceConfigs: DifficultyConfigWithRelations[];
    onEdit: (config: DifficultyConfigWithRelations) => void;
    onDelete: (config: DifficultyConfigWithRelations) => void;
}

function SiteSection({ siteName, defaultConfig, resourceConfigs, onEdit, onDelete }: SiteSectionProps) {
    const hasDefault = defaultConfig?.difficultyConfig;
    const visibleResourceConfigs = resourceConfigs.filter((c) => c.difficultyConfig);

    if (!hasDefault && visibleResourceConfigs.length === 0) {
        return <EmptyState title="No Configurations" description="Create your first difficulty configuration to get started." />;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold">{siteName}</h2>
            <div className="space-y-4">
                <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {hasDefault && (
                        <DifficultyConfigCard
                            title="Default Configuration"
                            config={defaultConfig}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    )}
                    {visibleResourceConfigs.map((config) => (
                        <DifficultyConfigCard
                            key={config.id}
                            title={config.resourceName || `Resource ${config.resourceID}`}
                            config={config}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export function DifficultyList({
    difficultyConfigs,
    selectedSiteId,
    selectedSiteName,
    onEdit,
    onDelete,
}: DifficultyListProps) {
    const configsBySite = useMemo(() => {
        return difficultyConfigs.reduce(
            (acc, config) => {
                if (!acc[config.siteID]) {
                    acc[config.siteID] = [];
                }
                acc[config.siteID].push(config);
                return acc;
            },
            {} as Record<number, DifficultyConfigWithRelations[]>
        );
    }, [difficultyConfigs]);

    const sitesToShow = useMemo(() => {
        if (selectedSiteId) {
            return [selectedSiteId];
        }
        return Object.keys(configsBySite).map(Number);
    }, [selectedSiteId, configsBySite]);

    if (sitesToShow.length === 0) {
        return (
            <div className="mt-6 space-y-6">
                <EmptyState title="No Configurations" description="Create your first difficulty configuration to get started." />
            </div>
        );
    }

    return (
        <div className="mt-6 space-y-6">
            {sitesToShow.map((siteId) => {
                const siteConfigs = configsBySite[siteId] || [];
                const defaultConfig = siteConfigs.find((c) => c.resourceID === null);
                const resourceConfigs = siteConfigs.filter((c) => c.resourceID !== null);

                return (
                    <SiteSection
                        key={siteId}
                        siteName={selectedSiteName}
                        defaultConfig={defaultConfig}
                        resourceConfigs={resourceConfigs}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                );
            })}
        </div>
    );
}
