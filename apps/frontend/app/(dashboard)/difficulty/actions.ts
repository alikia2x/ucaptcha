"use server";

import { revalidatePath } from "next/cache";
import {
	getDifficultyConfigs,
	createDifficultyConfig,
	updateDifficultyConfig,
	deleteDifficultyConfig,
} from "@ucaptcha/shared";
import { getSites } from "@ucaptcha/shared";
import { getResources } from "@ucaptcha/shared";
import type { DifficultyConfigValue } from "@ucaptcha/shared";

export async function getDifficultyData(userID: number, siteID?: number) {
	const difficultyConfigs = await getDifficultyConfigs(userID, siteID);
	const sites = await getSites(userID);
	const resources = await getResources(userID, siteID);

	return { difficultyConfigs, sites, resources };
}

export async function createDifficultyConfigAction(_userID: number, formData: FormData) {
	const siteID = parseInt(formData.get("siteID") as string, 10);
	const resourceID = formData.get("resourceID") as string;
	const defaultDifficulty = parseInt(formData.get("defaultDifficulty") as string, 10);
	const customRulesJson = formData.get("customRules") as string;

	if (!siteID || Number.isNaN(defaultDifficulty)) {
		throw new Error("Site ID and default difficulty are required");
	}

	let customRules: DifficultyConfigValue["custom"] = [];
	if (customRulesJson) {
		try {
			customRules = JSON.parse(customRulesJson);
		} catch (error) {
			console.error("Error parsing custom rules:", error);
		}
	}

	const difficultyConfig: DifficultyConfigValue = {
		default: defaultDifficulty,
		custom: customRules,
	};

	await createDifficultyConfig({
		siteID,
		resourceID: resourceID ? parseInt(resourceID, 10) : null,
		difficultyConfig,
	});

	revalidatePath("/difficulty");
	revalidatePath(`/difficulty/${siteID}`);
}

export async function updateDifficultyConfigAction(_userID: number, formData: FormData) {
	const id = parseInt(formData.get("id") as string, 10);
	const defaultDifficulty = parseInt(formData.get("defaultDifficulty") as string, 10);
	const customRulesJson = formData.get("customRules") as string;

	if (!id || Number.isNaN(defaultDifficulty)) {
		throw new Error("ID and default difficulty are required");
	}

	let customRules: DifficultyConfigValue["custom"] = [];
	if (customRulesJson) {
		try {
			customRules = JSON.parse(customRulesJson);
		} catch (error) {
			console.error("Error parsing custom rules:", error);
		}
	}

	const difficultyConfig: DifficultyConfigValue = {
		default: defaultDifficulty,
		custom: customRules,
	};

	await updateDifficultyConfig({
		id,
		difficultyConfig,
	});

	revalidatePath("/difficulty");
}

export async function deleteDifficultyConfigAction(_userID: number, formData: FormData) {
	const id = parseInt(formData.get("id") as string, 10);

	if (!id) {
		throw new Error("ID is required");
	}

	await deleteDifficultyConfig(id);
	revalidatePath("/difficulty");
}
