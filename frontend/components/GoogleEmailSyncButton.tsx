import { Button } from "@heroui/react";
import posthog from "posthog-js";

import { GoogleIcon } from "@/components/icons";

const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

const handleGoogleEmailSync = () => {
	posthog.capture("email_sync_started");
	window.location.href = `${apiUrl}/auth/google/email-sync`; // Initiate OAuth with gmail.readonly scope
};

const GoogleEmailSyncButton = () => {
	return (
		<div className="space-y-4 text-center">
			<Button
				className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
				startContent={<GoogleIcon size={20} />}
				onPress={handleGoogleEmailSync}
			>
				Connect Gmail Account
			</Button>
			<p className="text-xs text-gray-500">
				You can connect a different Gmail account than the one you signed up with.
			</p>
		</div>
	);
};

export default GoogleEmailSyncButton;
