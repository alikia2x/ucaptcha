interface EmptyStateProps {
	title: string;
	description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
	return (
		<div className="w-full h-[calc(100vh-14rem)] flex items-center justify-center flex-col gap-2">
			<h2 className="text-3xl">{title}</h2>
			<p className="text-muted-foreground">{description}</p>
		</div>
	);
}
