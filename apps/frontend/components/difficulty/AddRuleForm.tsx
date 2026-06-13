"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import type { CustomRule } from "./CustomRulesManager";

interface AddRuleFormProps {
	onAddRule: (rule: CustomRule) => void;
}

export function AddRuleForm({ onAddRule }: AddRuleFormProps) {
	const [newRule, setNewRule] = useState<CustomRule>({
		timeRange: 0,
		threshold: 0,
		difficulty: 0,
	});

	const addRule = () => {
		if (newRule.timeRange > 0 && newRule.threshold > 0 && newRule.difficulty > 0) {
			onAddRule(newRule);
			setNewRule({ timeRange: 0, threshold: 0, difficulty: 0 });
		}
	};

	return (
		<div className="space-y-4">
			<Label className="text-base font-medium">Add New Rule</Label>

			<div className="flex flex-col gap-4">
				<div>
					<Label htmlFor="timeRange" className="mb-1.5">
						Time Range (seconds)
					</Label>
					<Input
						id="timeRange"
						type="number"
						value={newRule.timeRange || ""}
						onChange={(e) =>
							setNewRule({
								...newRule,
								timeRange: parseInt(e.target.value, 10) || 0,
							})
						}
						placeholder="Timerange"
						min="1"
					/>
				</div>
				<div>
					<Label htmlFor="threshold" className="mb-1.5">
						Threshold
					</Label>
					<Input
						id="threshold"
						type="number"
						value={newRule.threshold || ""}
						onChange={(e) =>
							setNewRule({
								...newRule,
								threshold: parseInt(e.target.value, 10) || 0,
							})
						}
						placeholder="Threshold"
						min="1"
					/>
				</div>
				<div>
					<Label htmlFor="difficulty" className="mb-1.5">
						Difficulty
					</Label>
					<Input
						id="difficulty"
						type="number"
						value={newRule.difficulty || ""}
						onChange={(e) =>
							setNewRule({
								...newRule,
								difficulty: parseInt(e.target.value, 10) || 0,
							})
						}
						placeholder="Difficulty"
						min="1"
					/>
				</div>
				<div className="flex items-end">
					<Button
						onClick={addRule}
						className="w-full"
						disabled={
							!newRule.timeRange || !newRule.threshold || !newRule.difficulty
						}
					>
						<Plus className="w-4 h-4 mr-2" />
						Add Rule
					</Button>
				</div>
			</div>
		</div>
	);
}
