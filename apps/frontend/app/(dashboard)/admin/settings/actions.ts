"use server";

import { revalidatePath } from "next/cache";
import { settingsManager } from "@ucaptcha/shared";

export interface AllSettings {
	rateLimitPerSec: number;
	monthlyQuota: number;
	allowSignup: boolean;
}

export async function getSettings(): Promise<AllSettings> {
	const [rateLimitPerSec, monthlyQuota, allowSignup] = await Promise.all([
		settingsManager.get("rateLimitPerSec"),
		settingsManager.get("monthlyQuota"),
		settingsManager.get("allowSignup"),
	]);

	return { rateLimitPerSec, monthlyQuota, allowSignup };
}

export async function updateSetting<K extends keyof AllSettings>(
	key: K,
	value: AllSettings[K],
): Promise<void> {
	await settingsManager.set(key, value);
	revalidatePath("/admin/settings");
}
