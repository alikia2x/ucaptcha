import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { initSQL } from "../sql/init";
import { sql } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error("DATABASE_URL environment variable is required");
}

export const db: PostgresJsDatabase<Record<string, never>> = drizzle({
	connection: connectionString,
	casing: "snake_case",
});

export async function initDB() {
	await db.execute(sql.raw(initSQL));
}
