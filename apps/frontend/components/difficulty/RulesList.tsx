"use client";

import { Label } from "@/components/ui/label";
import { RuleItem } from "./RuleItem";
import type { CustomRule } from "./CustomRulesManager";

interface RulesListProps {
	rules: CustomRule[];
	onUpdate: (index: number, field: keyof CustomRule, value: number) => void;
	onRemove: (index: number) => void;
}

export function RulesList({ rules, onUpdate, onRemove }: RulesListProps) {
	if (rules.length === 0) {
		return null;
	}

	return (
		<div className="space-y-3">
			<Label className="text-base font-medium">
				Current Rules ({rules.length})
			</Label>
			<div className="space-y-3">
				{rules.map((rule, index) => (
					<RuleItem
						// biome-ignore lint/suspicious/noArrayIndexKey: Rules have no natural unique ID; the list is stable and index-based keys are acceptable here
						key={index}
						rule={rule}
						index={index}
						onUpdate={onUpdate}
						onRemove={onRemove}
					/>
				))}
			</div>
		</div>
	);
}
