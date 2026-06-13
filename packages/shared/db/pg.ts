import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { initSQL } from "../sql/init";
import { sql } from "drizzle-orm";

export const db: PostgresJsDatabase<Record<string, never>> = drizzle({
	connection: process.env.DATABASE_URL!,
	casing: "snake_case",
});

export async function initDB() {
	await db.execute(sql.raw(initSQL));
}
