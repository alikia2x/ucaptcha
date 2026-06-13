import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export const errorResponse = (c: Context, message: string, code: ContentfulStatusCode) =>
	c.json(
		{
			message: message,
		},
		code
	);
