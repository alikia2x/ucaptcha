"use client";

import { Label } from "@/components/ui/label";
import { AddRuleForm } from "./AddRuleForm";
import { RulesList } from "./RulesList";

export interface CustomRule {
	timeRange: number;
	threshold: number;
	difficulty: number;
}

interface CustomRulesManagerProps {
	customRules: CustomRule[];
	onCustomRulesChange: (rules: CustomRule[]) => void;
}

export function CustomRulesManager({ customRules, onCustomRulesChange }: CustomRulesManagerProps) {
	const addRule = (rule: CustomRule) => {
		onCustomRulesChange([...customRules, rule]);
	};

	const removeRule = (index: number) => {
		const updatedRules = customRules.filter((_, i) => i !== index);
		onCustomRulesChange(updatedRules);
	};

	const updateRule = (index: number, field: keyof CustomRule, value: number) => {
		const updatedRules = [...customRules];
		updatedRules[index] = { ...updatedRules[index], [field]: value };
		onCustomRulesChange(updatedRules);
	};

	return (
		<div className="space-y-4">
			<div>
				<Label className="text-lg font-medium">Custom Rules</Label>
				<p className="text-sm text-muted-foreground mb-4">
					Define custom difficulty rules based on time range and threshold
				</p>
			</div>

			<AddRuleForm onAddRule={addRule} />

			<RulesList
				rules={customRules}
				onUpdate={updateRule}
				onRemove={removeRule}
			/>
		</div>
	);
}
