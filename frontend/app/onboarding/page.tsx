"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { addToast } from "@heroui/toast";

import { Navbar } from "@/components/navbar";
import Spinner from "@/components/spinner";
import { checkAuth } from "@/utils/auth";

function OnboardingContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

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

			// Complete onboarding (new value-first flow - everyone starts free)
			try {
				const response = await fetch(`${apiUrl}/api/users/complete-onboarding`, {
					method: "POST",
					credentials: "include",
					headers: { "Content-Type": "application/json" }
				});

				if (response.ok) {
					addToast({
						title: "Let's connect your email to find your applications.",
						color: "success"
					});
					router.push("/email-sync-setup");
				} else {
					const data = await response.json();
					// If already completed, just redirect
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
			}
		};

		init();
	}, [apiUrl, router, searchParams]);

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
