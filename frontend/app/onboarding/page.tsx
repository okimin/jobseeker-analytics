"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { addToast } from "@heroui/toast";
import { Button } from "@heroui/react";
import posthog from "posthog-js";

import { Navbar } from "@/components/navbar";
import Spinner from "@/components/spinner";
import { checkAuth } from "@/utils/auth";

const PRESETS = [
	{ value: "1_week", label: "Last week" },
	{ value: "1_month", label: "Last month" },
	{ value: "3_months", label: "3 months" }
];

function OnboardingContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

	const [isLoading, setIsLoading] = useState(true);
	const [showStartDatePicker, setShowStartDatePicker] = useState(false);
	const [selectedPreset, setSelectedPreset] = useState<string | null>("1_month");
	const [customDate, setCustomDate] = useState("");
	const [fetchOrder, setFetchOrder] = useState<string>("recent_first");
	const [endDate, setEndDate] = useState<string>("");
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		const init = async () => {
			const isAuthenticated = await checkAuth(apiUrl);
			if (!isAuthenticated) {
				addToast({
					title: "Please log in to continue",
					color: "warning"
				});
				router.push("/login");
				return;
			}

			// Identify user in PostHog early in the funnel
			try {
				const userResponse = await fetch(`${apiUrl}/me`, {
					method: "GET",
					credentials: "include"
				});
				if (userResponse.ok) {
					const userData = await userResponse.json();
					if (userData.user_id) {
						posthog.identify(userData.user_id, { email: userData.email });
					}
				}
			} catch {
				// Silently fail - don't block onboarding
			}

			// Check if returning from successful Stripe checkout (legacy flow)
			const success = searchParams.get("success");
			const sessionId = searchParams.get("session_id");

			if (success === "true" && sessionId) {
				addToast({
					title: "Payment successful! Now let's connect your email.",
					color: "success"
				});
				router.push("/email-sync-setup");
				return;
			}

			// Check user's onboarding status
			try {
				const response = await fetch(`${apiUrl}/api/users/onboarding-status`, {
					credentials: "include"
				});
				if (response.ok) {
					const data = await response.json();
					if (data.has_completed_onboarding) {
						// Onboarding done - check email sync
						if (data.has_email_sync_configured) {
							router.push("/dashboard");
						} else {
							router.push("/email-sync-setup");
						}
						return;
					}
				}
			} catch (error) {
				console.error("Error checking onboarding status:", error);
			}

			// Show start date picker for new users
			setIsLoading(false);
			setShowStartDatePicker(true);
			posthog.capture("onboarding_started");
		};

		init();
	}, [apiUrl, router, searchParams]);

	const handleContinue = async () => {
		setIsSaving(true);

		try {
			// Save start date
			const startDateData = selectedPreset
				? { preset: selectedPreset, fetch_order: fetchOrder, end_date: endDate || null }
				: { preset: "custom", custom_date: customDate, fetch_order: fetchOrder, end_date: endDate || null };

			const startDateResponse = await fetch(`${apiUrl}/settings/start-date`, {
				method: "PUT",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(startDateData)
			});

			if (!startDateResponse.ok) {
				throw new Error("Failed to save start date");
			}

			// Complete onboarding
			const response = await fetch(`${apiUrl}/api/users/complete-onboarding`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" }
			});

			if (response.ok) {
				posthog.capture("onboarding_completed", {
					start_date_preset: selectedPreset || "custom"
				});
				addToast({
					title: "Let's connect your email to find your applications.",
					color: "success"
				});
				router.push("/email-sync-setup");
			} else {
				const data = await response.json();
				if (data.detail === "Onboarding already completed") {
					router.push("/email-sync-setup");
				} else {
					throw new Error(data.detail || "Failed to complete onboarding");
				}
			}
		} catch (error) {
			console.error("Error completing onboarding:", error);
			addToast({
				title: "Something went wrong",
				description: "Please try again.",
				color: "danger"
			});
		} finally {
			setIsSaving(false);
		}
	};

	const isValid = selectedPreset || customDate;

	// Compute the effective selected date for isOldDate check
	const effectiveDate = (() => {
		if (selectedPreset) {
			const daysMap: Record<string, number> = { "1_week": 7, "1_month": 30, "3_months": 90 };
			const days = daysMap[selectedPreset];
			if (days) {
				const d = new Date();
				d.setDate(d.getDate() - days);
				return d.toISOString().split("T")[0];
			}
		}
		return customDate || "";
	})();

	const isOldDate = (() => {
		if (!effectiveDate) return false;
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
		return new Date(effectiveDate) < thirtyDaysAgo;
	})();

	if (isLoading) {
		return (
			<div className="flex flex-col min-h-screen">
				<Navbar />
				<main className="flex-grow flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
					<Spinner />
					<p className="mt-4 text-gray-600 dark:text-gray-300">Setting up your account...</p>
				</main>
			</div>
		);
	}

	if (showStartDatePicker) {
		return (
			<div className="flex flex-col min-h-screen">
				<Navbar />
				<main className="flex-grow flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
					<div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
						<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
							When did you start your job search?
						</h1>
						<p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
							We&apos;ll scan for job application emails after this date.
						</p>

						{/* Presets */}
						<div className="flex gap-2 mb-4">
							{PRESETS.map((preset) => (
								<button
									key={preset.value}
									className={`flex-1 py-2 px-3 rounded-lg border text-sm transition-colors ${
										selectedPreset === preset.value
											? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
											: "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
									}`}
									onClick={() => {
										setSelectedPreset(preset.value);
										setCustomDate("");
									}}
								>
									{preset.label}
								</button>
							))}
						</div>

						{/* Custom date picker */}
						<div className="mb-4">
							<label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
								Or choose a specific date:
							</label>
							<input
								className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
								max={new Date().toISOString().split("T")[0]}
								type="date"
								value={customDate}
								onChange={(e) => {
									setCustomDate(e.target.value);
									setSelectedPreset(null);
								}}
							/>
						</div>

						{/* End date picker */}
						<div className="mt-3 mb-4">
							<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
								End date (optional)
							</label>
							<input
								type="date"
								className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
								value={endDate}
								min={effectiveDate || ""}
								max={new Date().toISOString().split("T")[0]}
								onChange={(e) => setEndDate(e.target.value)}
							/>
							<p className="text-xs text-gray-500 mt-1">Leave blank to scan through today</p>
						</div>

						{/* Fetch order toggle — only shown when start date is older than 30 days */}
						{isOldDate && (
							<div className="mt-3 mb-4">
								<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
									Process order
								</label>
								<div className="flex gap-2 mt-1">
									<button
										className={`flex-1 py-2 px-3 rounded-lg border text-sm transition-colors ${
											fetchOrder === "recent_first"
												? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
												: "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
										}`}
										onClick={() => setFetchOrder("recent_first")}
									>
										Recent first
									</button>
									<button
										className={`flex-1 py-2 px-3 rounded-lg border text-sm transition-colors ${
											fetchOrder === "oldest_first"
												? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
												: "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
										}`}
										onClick={() => setFetchOrder("oldest_first")}
									>
										Oldest first
									</button>
								</div>
								<p className="text-xs text-gray-500 mt-1">
									{fetchOrder === "oldest_first"
										? "Processes emails starting from your start date forward."
										: "Processes your most recent emails first."}
								</p>
							</div>
						)}

						<Button
							className="w-full"
							color="primary"
							disabled={!isValid || isSaving}
							isLoading={isSaving}
							size="lg"
							onPress={handleContinue}
						>
							Continue
						</Button>
					</div>
				</main>
			</div>
		);
	}

	return (
		<div className="flex flex-col min-h-screen">
			<Navbar />
			<main className="flex-grow flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
				<Spinner />
				<p className="mt-4 text-gray-600 dark:text-gray-300">Setting up your account...</p>
			</main>
		</div>
	);
}

export default function OnboardingPage() {
	return (
		<Suspense
			fallback={
				<div className="flex flex-col min-h-screen">
					<Navbar />
					<main className="flex-grow flex items-center justify-center">
						<Spinner />
					</main>
				</div>
			}
		>
			<OnboardingContent />
		</Suspense>
	);
}
