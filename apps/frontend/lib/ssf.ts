"use server";

import { getUserQuota } from "@ucaptcha/shared";

export async function getQuota(uid: number) {
	return getUserQuota(uid, false);
}