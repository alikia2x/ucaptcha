"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import type { CustomRule } from "./CustomRulesManager";

interface RuleItemProps {
	rule: CustomRule;
	index: number;
	onUpdate: (index: number, field: keyof CustomRule, value: number) => void;
	onRemove: (index: number) => void;
}

export function RuleItem({ rule, index, onUpdate, onRemove }: RuleItemProps) {
	return (
		<div className="flex items-center gap-4 p-3 border rounded-lg">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
				<div>
					<Label className="text-xs mb-1">Time Range</Label>
					<Input
						type="number"
						value={rule.timeRange}
						onChange={(e) =>
							onUpdate(index, "timeRange", parseInt(e.target.value, 10) || 0)
						}
						min="1"
					/>
				</div>
				<div>
					<Label className="text-xs mb-1">Threshold</Label>
					<Input
						type="number"
						value={rule.threshold}
						onChange={(e) =>
							onUpdate(index, "threshold", parseInt(e.target.value, 10) || 0)
						}
						min="1"
					/>
				</div>
				<div>
					<Label className="text-xs mb-1">Difficulty</Label>
					<Input
						type="number"
						value={rule.difficulty}
						onChange={(e) =>
							onUpdate(index, "difficulty", parseInt(e.target.value, 10) || 0)
						}
						min="1"
					/>
				</div>
			</div>
			<Button
				variant="outline"
				size="sm"
				onClick={() => onRemove(index)}
				className="shrink-0"
			>
				<Trash2 className="w-4 h-4" />
			</Button>
		</div>
	);
}
