"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { addToast } from "@heroui/toast";

import { Navbar } from "@/components/navbar";
import PricingTable from "@/components/PricingTable";
import Spinner from "@/components/spinner";
import SubsidizedCommitment from "@/components/SubsidizedCommitment";
import { checkAuth } from "@/utils/auth";

function OnboardingContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

	const [isLoading, setIsLoading] = useState(false);
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);
	const [showCommitmentModal, setShowCommitmentModal] = useState(false);

	// Get preselected tier from URL params or localStorage (preserved through OAuth)
	const [preselectedTier, setPreselectedTier] = useState<string | undefined>(undefined);
	const [preselectedAmount, setPreselectedAmount] = useState<number | undefined>(undefined);

	useEffect(() => {
		// Check URL params first, then localStorage
		const urlTier = searchParams.get("tier");
		const urlAmount = searchParams.get("amount");

		if (urlTier) {
			setPreselectedTier(urlTier);
			if (urlAmount) {
				setPreselectedAmount(parseInt(urlAmount));
			}
			// Auto-trigger modal for subsidized tier from URL
			if (urlTier === "subsidized") {
				setShowCommitmentModal(true);
			}
		} else {
			// Check localStorage for tier selection made before OAuth
			const storedTier = localStorage.getItem("pendingTier");
			const storedAmount = localStorage.getItem("pendingAmount");
			if (storedTier) {
				setPreselectedTier(storedTier);
				if (storedAmount) {
					setPreselectedAmount(parseInt(storedAmount));
				}
				// Clear localStorage after reading
				localStorage.removeItem("pendingTier");
				localStorage.removeItem("pendingAmount");
				// Auto-trigger modal for subsidized tier from localStorage
				if (storedTier === "subsidized") {
					setShowCommitmentModal(true);
				}
			}
		}
	}, [searchParams]);

	// Check auth and handle Stripe success callback
	useEffect(() => {
		const init = async () => {
			const isAuthenticated = await checkAuth(apiUrl);
			if (!isAuthenticated) {
				addToast({
					title: "Please log in to continue",
					color: "warning"
				});
				// Preserve tier selection through login
				const params = new URLSearchParams();
				if (preselectedTier) params.set("tier", preselectedTier);
				if (preselectedAmount) params.set("amount", String(preselectedAmount));
				router.push(`/login?${params.toString()}`);
				return;
			}

			// Check if returning from successful Stripe checkout
			const success = searchParams.get("success");
			const sessionId = searchParams.get("session_id");

			if (success === "true" && sessionId) {
				// Stripe webhook should have updated the user, redirect to email sync setup
				addToast({
					title: "Payment successful! Now let's connect your email.",
					color: "success"
				});
				router.push("/email-sync-setup");
				return;
			}

			// Check if canceled from Stripe
			const canceled = searchParams.get("canceled");
			if (canceled === "true") {
				addToast({
					title: "Checkout canceled",
					description: "You can select a different tier or try again.",
					color: "warning"
				});
			}

			// Check if user already completed onboarding
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

			setIsCheckingAuth(false);
		};

		init();
	}, [apiUrl, router, searchParams, preselectedTier, preselectedAmount]);

	const handleSelectTier = async (tier: string, customAmount?: number) => {
		setIsLoading(true);

		try {
			if (tier === "subsidized") {
				// Show commitment modal for $0 tier
				setIsLoading(false);
				setShowCommitmentModal(true);
				return;
			} else {
				// Create Stripe checkout session for paid tiers
				const response = await fetch(`${apiUrl}/api/billing/create-checkout-session`, {
					method: "POST",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						tier,
						custom_amount: customAmount
					})
				});

				if (response.ok) {
					const data = await response.json();
					// Redirect to Stripe Checkout
					window.location.href = data.checkout_url;
				} else {
					const data = await response.json();
					throw new Error(data.detail || "Failed to create checkout session");
				}
			}
		} catch (error) {
			console.error("Error:", error);
			addToast({
				title: "Something went wrong",
				description: error instanceof Error ? error.message : "Please try again or contact support.",
				color: "danger"
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubsidizedConfirm = async () => {
		try {
			const response = await fetch(`${apiUrl}/api/users/complete-onboarding`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" }
			});

			if (response.ok) {
				addToast({
					title: "Account ready! Now let's connect your email.",
					color: "success"
				});
				router.push("/email-sync-setup");
			} else {
				const data = await response.json();
				throw new Error(data.detail || "Failed to complete onboarding");
			}
		} catch (error) {
			console.error("Error:", error);
			addToast({
				title: "Something went wrong",
				description: error instanceof Error ? error.message : "Please try again.",
				color: "danger"
			});
			setShowCommitmentModal(false);
		}
	};

	const handleSubsidizedCancel = () => {
		setShowCommitmentModal(false);
	};

	if (isCheckingAuth) {
		return (
			<div className="flex flex-col min-h-screen">
				<Navbar />
				<main className="flex-grow flex items-center justify-center">
					<Spinner />
				</main>
			</div>
		);
	}

	return (
		<div className="flex flex-col min-h-screen">
			<Navbar />
			<main className="flex-grow bg-gradient-to-b from-background to-background/95 py-16">
				<div className="container mx-auto px-4">
					<div className="text-center mb-8">
						<h1 className="text-2xl font-bold mb-2">Choose Your Plan</h1>
						<p className="text-gray-600 dark:text-gray-300">
							Select how you would like to support the community.
						</p>
					</div>
					<PricingTable
						isLoading={isLoading}
						preselectedAmount={preselectedAmount}
						preselectedTier={preselectedTier}
						onSelectTier={handleSelectTier}
					/>
				</div>
			</main>
			<SubsidizedCommitment
				isOpen={showCommitmentModal}
				onCancel={handleSubsidizedCancel}
				onConfirm={handleSubsidizedConfirm}
			/>
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
