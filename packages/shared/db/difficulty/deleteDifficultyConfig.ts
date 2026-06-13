import { db } from "../pg";
import { difficultyConfigTable } from "../schema";
import { eq } from "drizzle-orm";

export async function deleteDifficultyConfig(id: number) {
	const result = await db
		.delete(difficultyConfigTable)
		.where(eq(difficultyConfigTable.id, id))
		.returning();

	return result[0];
}
