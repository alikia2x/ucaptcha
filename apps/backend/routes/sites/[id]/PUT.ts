import type { Context } from "hono";
import { eq, and } from "drizzle-orm";
import { sitesTable } from "@ucaptcha/shared";
import { db } from "@ucaptcha/shared";
import { verifyAuthToken } from "@ucaptcha/shared";
import { errorResponse } from "@/lib/common";

export async function updateSite(c: Context) {
	try {
		const authHeader = c.req.header("Authorization");
		if (!authHeader?.startsWith("Bearer ")) {
			return errorResponse(c, "Unauthorized", 401);
		}

		const token = authHeader.substring(7);
		const { payload } = await verifyAuthToken(token);

		if (!payload) {
			return errorResponse(c, "Invalid token", 401);
		}

		const siteID = parseInt(c.req.param("id"), 10);
		if (Number.isNaN(siteID)) {
			return errorResponse(c, "Invalid site ID", 400);
		}

		const body = await c.req.json();
		const { name } = body;

		if (!name) {
			return errorResponse(c, "Site name is required", 400);
		}

		const [updatedSite] = await db
			.update(sitesTable)
			.set({ name, updatedAt: new Date() })
			.where(and(eq(sitesTable.id, siteID), eq(sitesTable.userID, payload.userID)))
			.returning();

		if (!updatedSite) {
			return errorResponse(c, "Site not found or access denied", 404);
		}

		return c.json({ site: updatedSite });
	} catch (error) {
		console.error("Error updating site:", error);
		return errorResponse(c, "Failed to update site", 500);
	}
}
