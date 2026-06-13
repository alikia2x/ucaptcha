import { redis } from "../redis";
import { db } from "../pg";
import { difficultyConfigTable } from "../schema";
import { eq } from "drizzle-orm";

export async function deleteDifficultyConfig(id: number) {
	const existing = await db
		.select()
		.from(difficultyConfigTable)
		.where(eq(difficultyConfigTable.id, id))
		.limit(1);

	const result = await db
		.delete(difficultyConfigTable)
		.where(eq(difficultyConfigTable.id, id))
		.returning();

	const deleted = result[0];

	if (deleted) {
		const keysToDelete: string[] = [
			`ucaptcha:difficulty_config:${deleted.siteID}`,
		];

		if (deleted.resourceID) {
			keysToDelete.push(`ucaptcha:difficulty_config:${deleted.siteID}-${deleted.resourceID}`);
		}

		await redis.del(keysToDelete);
	}

	return deleted;
}
