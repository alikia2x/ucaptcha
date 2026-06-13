import { redis } from "../redis";
import { db } from "../pg";
import { type DifficultyConfig, difficultyConfigTable } from "../schema";

type CreateDifficultyConfigParams = Pick<
	DifficultyConfig,
	"siteID" | "resourceID" | "difficultyConfig"
>;

export async function createDifficultyConfig({
	siteID,
	resourceID,
	difficultyConfig,
}: CreateDifficultyConfigParams) {
	const result = await db
		.insert(difficultyConfigTable)
		.values({
			siteID,
			resourceID,
			difficultyConfig: difficultyConfig,
		})
		.returning();

	const created = result[0];

	if (created) {
		const keysToDelete: string[] = [
			`ucaptcha:difficulty_config:${siteID}`,
		];

		if (resourceID) {
			keysToDelete.push(`ucaptcha:difficulty_config:${siteID}-${resourceID}`);
		}

		await redis.del(keysToDelete);
	}

	return created;
}
