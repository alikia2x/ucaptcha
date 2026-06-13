import { redis } from "../redis";
import { db } from "../pg";
import { type DifficultyConfig, difficultyConfigTable } from "../schema";
import { eq } from "drizzle-orm";

type UpdateDifficultyConfigParams = Pick<DifficultyConfig, "id" | "difficultyConfig"> & {
	resourceID?: number;
};

export async function updateDifficultyConfig({
	id,
	difficultyConfig,
	resourceID,
}: UpdateDifficultyConfigParams) {
	console.log(id, difficultyConfig, resourceID)
	const existing = await db
		.select()
		.from(difficultyConfigTable)
		.where(eq(difficultyConfigTable.id, id))
		.limit(1);

	const oldSiteID = existing[0]?.siteID;
	const oldResourceID = existing[0]?.resourceID;

	const result = await db
		.update(difficultyConfigTable)
		.set({
			resourceID: resourceID,
			difficultyConfig,
			updatedAt: new Date(),
		})
		.where(eq(difficultyConfigTable.id, id))
		.returning();

	const updated = result[0];

	if (oldSiteID != null) {
		const keysToDelete: string[] = [
			`ucaptcha:difficulty_config:${oldSiteID}`,
		];

		if (oldResourceID) {
			keysToDelete.push(`ucaptcha:difficulty_config:${oldSiteID}-${oldResourceID}`);
		}

		const newResourceID = updated?.resourceID;
		if (newResourceID && newResourceID !== oldResourceID) {
			keysToDelete.push(`ucaptcha:difficulty_config:${oldSiteID}-${newResourceID}`);
		}

		await redis.del(keysToDelete);
	}

	return updated;
}
