import { cookies } from "next/headers";
import { verifyAuthToken } from "@ucaptcha/shared";
import { getSettings } from "./actions";
import Settings from "@/components/Settings";

export default async function SettingsPage() {
	const cookieStore = await cookies();
	const token = cookieStore.get("auth_token");

	if (!token) {
		return (
			<div className="font-sans">
				<h1 className="text-2xl font-semibold mt-4 ml-1">Settings</h1>
				<div className="mt-4">
					<p>Please log in to access settings.</p>
				</div>
			</div>
		);
	}

	const { payload } = await verifyAuthToken(token.value);
	if (!payload || payload.role !== "admin") {
		return (
			<div className="font-sans">
				<h1 className="text-2xl font-semibold mt-4 ml-1">Settings</h1>
				<div className="mt-4">
					<p>You do not have permission to access this page.</p>
				</div>
			</div>
		);
	}

	const settings = await getSettings();

	return (
		<div className="container mx-auto py-6">
			<Settings initialSettings={settings} />
		</div>
	);
}
