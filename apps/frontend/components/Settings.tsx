"use client";

import { useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { Activity, Database, UserPlus, Save } from "lucide-react";
import type { AllSettings } from "@/app/(dashboard)/admin/settings/actions";

interface SettingsProps {
	initialSettings: AllSettings;
}

export default function Settings({ initialSettings }: SettingsProps) {
	const [settings, setSettings] = useState<AllSettings>(initialSettings);
	const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

	const handleSave = async (key: keyof AllSettings, value: AllSettings[keyof AllSettings]) => {
		setMessage(null);

		try {
			const { updateSetting } = await import(
				"@/app/(dashboard)/admin/settings/actions"
			);
			await updateSetting(key, value);
			setSettings((prev) => ({ ...prev, [key]: value }));
			setMessage({ type: "success", text: `"${key}" updated successfully` });
		} catch (error) {
			setMessage({
				type: "error",
				text: error instanceof Error ? error.message : `Error updating "${key}"`,
			});
		}
	};

	return (
		<div className="font-sans">
			<Typography.H1 className="mt-4 ml-1">Admin Settings</Typography.H1>

			{message && (
				<div
					className={`mt-4 p-4 rounded-lg ${
						message.type === "success"
							? "bg-green-100 text-green-800"
							: "bg-red-100 text-red-800"
					}`}
				>
					{message.text}
				</div>
			)}

			<div className="mt-6 space-y-6">
				{/* Rate Limit */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Activity className="size-5" />
							Rate Limit
						</CardTitle>
						<CardDescription>
							Maximum number of requests allowed per second globally.
						</CardDescription>
					</CardHeader>
					<div className="p-6">
						<div className="flex items-end gap-4">
							<div className="flex-1">
								<Label htmlFor="rateLimitPerSec">Requests per Second</Label>
								<Input
									id="rateLimitPerSec"
									type="number"
									min={1}
									value={settings.rateLimitPerSec}
									onChange={(e) =>
										setSettings((prev) => ({
											...prev,
											rateLimitPerSec: Number(e.target.value),
										}))
									}
									className="mt-1"
								/>
							</div>
							<Button
								onClick={() =>
									handleSave("rateLimitPerSec", settings.rateLimitPerSec)
								}
								className="flex items-center gap-2"
							>
								<Save className="size-4" />
								Save
							</Button>
						</div>
					</div>
				</Card>

				{/* Monthly Quota */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Database className="size-5" />
							Monthly Quota
						</CardTitle>
						<CardDescription>
							Maximum number of new challenges allowed per account per month. Set to 0
							for unlimited.
						</CardDescription>
					</CardHeader>
					<div className="p-6">
						<div className="flex items-end gap-4">
							<div className="flex-1">
								<Label htmlFor="monthlyQuota">Monthly Challenge Limit</Label>
								<Input
									id="monthlyQuota"
									type="number"
									min={0}
									value={settings.monthlyQuota}
									onChange={(e) =>
										setSettings((prev) => ({
											...prev,
											monthlyQuota: Number(e.target.value),
										}))
									}
									className="mt-1"
								/>
							</div>
							<Button
								onClick={() =>
									handleSave("monthlyQuota", settings.monthlyQuota)
								}
								className="flex items-center gap-2"
							>
								<Save className="size-4" />
								Save
							</Button>
						</div>
					</div>
				</Card>

				{/* Allow Signup */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<UserPlus className="size-5" />
							Registration
						</CardTitle>
						<CardDescription>
							Control whether new users can sign up for accounts.
						</CardDescription>
					</CardHeader>
					<div className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<Label htmlFor="allowSignup" className="text-base">
									Allow New User Registration
								</Label>
								<p className="text-sm text-muted-foreground mt-1">
									When enabled, anyone can create a new account.
								</p>
							</div>
							<div className="flex items-center gap-4">
								<button
									type="button"
									id="allowSignup"
									role="switch"
									aria-checked={settings.allowSignup}
									onClick={() => {
										const newValue = !settings.allowSignup;
										setSettings((prev) => ({
											...prev,
											allowSignup: newValue,
										}));
										handleSave("allowSignup", newValue);
									}}
									className={`
										relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full
										border-2 border-transparent transition-colors duration-200
										ease-in-out focus:outline-none focus:ring-2 focus:ring-ring
										focus:ring-offset-2 focus:ring-offset-background
										${settings.allowSignup ? "bg-primary" : "bg-input"}
									`}
								>
									<span
										className={`
											pointer-events-none inline-block h-5 w-5 rounded-full
											bg-background shadow-sm ring-0 transition-transform
											duration-200 ease-in-out
											${settings.allowSignup ? "translate-x-5" : "translate-x-0"}
										`}
									/>
								</button>
								<span className="text-sm font-medium min-w-12">
									{settings.allowSignup ? "Enabled" : "Disabled"}
								</span>
							</div>
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
}
