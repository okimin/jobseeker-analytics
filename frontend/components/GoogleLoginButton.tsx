import { Button } from "@heroui/react";
import posthog from "posthog-js";

import { GoogleIcon } from "@/components/icons";

const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

const handleGoogleLogin = () => {
	posthog.capture("login_started", { method: "google" });
	window.location.href = `${apiUrl}/auth/google`; // Initiate OAuth
};

const GoogleLoginButton = () => {
	return (
		<div className="space-y-4 text-center">
			<Button
				aria-label="Sign in with Google account"
				className="w-full font-semibold"
				color="default"
				size="lg"
				startContent={<GoogleIcon size={20} />}
				variant="bordered"
				onPress={handleGoogleLogin}
			>
				Sign in with Google
			</Button>
		</div>
	);
};

export default GoogleLoginButton;
