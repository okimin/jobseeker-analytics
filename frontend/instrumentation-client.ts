import posthog from "posthog-js";

// Check for GPC (Global Privacy Control) signal
const hasGPCSignal = () => {
	if (typeof navigator !== "undefined" && "globalPrivacyControl" in navigator) {
		return (navigator as Navigator & { globalPrivacyControl: boolean }).globalPrivacyControl === true;
	}
	return false;
};

// Initialize PostHog client for the frontend
if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
	posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
		api_host: "/ingest",
		ui_host: "https://us.posthog.com",
		defaults: "2026-01-30",
		opt_out_capturing_by_default: hasGPCSignal(), // Respect GPC signals
		debug: process.env.NODE_ENV === "development",
		mask_all_element_attributes: true,
		mask_all_text: true
	});
}
