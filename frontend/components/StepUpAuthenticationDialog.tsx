"use client";

import { Button } from "@heroui/react";

interface StepUpAuthenticationPromptProps {
	/** Text to describe what they are verifying for (e.g., "download your data") */
	actionText?: string;
	/** The URL path to return to after successfully re-authenticating (e.g., "/dashboard?action=download_csv") */
	returnUrl: string;
	/** Callback for when the user clicks "Go back" or "Cancel" */
	onCancel: () => void;
}

export default function StepUpAuthenticationPrompt({
	actionText = "continue",
	returnUrl,
	onCancel
}: StepUpAuthenticationPromptProps) {
	const handleVerify = () => {
		window.location.href = `/api/login?step_up=true&return_to=${encodeURIComponent(returnUrl)}`;
	};

	return (
		<div className="text-center py-6">
			<div className="text-4xl mb-4">🔒</div>
			<h3 className="text-lg font-semibold text-foreground dark:text-white mb-3">
				Verify your identity to continue
			</h3>
			<p className="text-sm text-foreground/70 dark:text-gray-300 mb-6 flex-wrap max-w-sm mx-auto">
				For your security, we require a fresh sign-in to {actionText}. You will be redirected to Google to
				verify it's you, and then brought right back here.
			</p>
			<div className="flex justify-center gap-3">
				<Button color="default" variant="light" onPress={onCancel}>
					Go back
				</Button>
				<Button color="primary" onPress={handleVerify}>
					Verify with Google
				</Button>
			</div>
		</div>
	);
}
