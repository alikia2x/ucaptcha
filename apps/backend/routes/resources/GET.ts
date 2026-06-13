import type { Context } from "hono";
import { errorResponse } from "@/lib/common";
import type { AuthStore } from "@/middleware/auth";
import { getResources } from "@ucaptcha/shared";

export async function getResourcesHandler(c: Context<{ Variables: AuthStore }>) {
	try {
		const payload = c.get("authPayload");
		const siteIDParam = c.req.query("siteID");
		const siteID = siteIDParam ? parseInt(siteIDParam, 10) : undefined;
		const userID = payload.userID;

		const resources = await getResources(userID, siteID);

		return c.json({ resources });
	} catch (error) {
		console.error("Error fetching resources:", error);
		return errorResponse(c, "Failed to fetch resources", 500);
	}
}
