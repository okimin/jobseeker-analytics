"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { addToast } from "@heroui/toast";

import { Navbar } from "@/components/navbar";
import Spinner from "@/components/spinner";
import SubsidizedCommitment from "@/components/SubsidizedCommitment";
import { checkAuth } from "@/utils/auth";

function CheckoutContent() {
	const router = useRouter();
	const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
	const [status, setStatus] = useState("Processing your selection...");
	const [showCommitmentModal, setShowCommitmentModal] = useState(false);

	useEffect(() => {
		const initiateCheckout = async () => {
			// Check authentication
			const isAuthenticated = await checkAuth(apiUrl);
			if (!isAuthenticated) {
				addToast({
					title: "Please sign up to continue",
					color: "warning"
				});
				router.push("/signup");
				return;
			}

			// Get tier from localStorage (stored before OAuth redirect)
			const tier = localStorage.getItem("pendingTier");
			const amountStr = localStorage.getItem("pendingAmount");
			const customAmount = amountStr ? parseInt(amountStr) : undefined;

			// Clear localStorage
			localStorage.removeItem("pendingTier");
			localStorage.removeItem("pendingAmount");

			if (!tier) {
				// No tier selected - redirect to onboarding to choose
				router.push("/onboarding");
				return;
			}

			try {
				if (tier === "subsidized") {
					// Check if commitment was already confirmed on pricing page
					const commitmentConfirmed = localStorage.getItem("subsidizedCommitmentConfirmed");
					localStorage.removeItem("subsidizedCommitmentConfirmed");

					if (commitmentConfirmed) {
						// Already confirmed - complete onboarding directly
						setStatus("Setting up your free account...");
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
							throw new Error(data.detail || "Failed to complete signup");
						}
						return;
					}

					// Show commitment modal for $0 tier
					setShowCommitmentModal(true);
					return; // Don't continue - modal will handle the rest
				} else {
					// Create Stripe checkout session for paid tiers
					setStatus("Redirecting to payment...");
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
				console.error("Checkout error:", error);
				addToast({
					title: "Something went wrong",
					description: error instanceof Error ? error.message : "Please try again.",
					color: "danger"
				});
				// Fallback to onboarding page
				router.push("/onboarding");
			}
		};

		initiateCheckout();
	}, [apiUrl, router]);

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
				throw new Error(data.detail || "Failed to complete signup");
			}
		} catch (error) {
			console.error("Checkout error:", error);
			addToast({
				title: "Something went wrong",
				description: error instanceof Error ? error.message : "Please try again.",
				color: "danger"
			});
			setShowCommitmentModal(false);
			router.push("/onboarding");
		}
	};

	const handleSubsidizedCancel = () => {
		setShowCommitmentModal(false);
		router.push("/pricing");
	};

	return (
		<div className="flex flex-col min-h-screen">
			<Navbar />
			<main className="flex-grow flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
				{!showCommitmentModal && (
					<>
						<Spinner />
						<p className="mt-4 text-gray-600 dark:text-gray-300">{status}</p>
					</>
				)}
			</main>
			<SubsidizedCommitment
				isOpen={showCommitmentModal}
				onCancel={handleSubsidizedCancel}
				onConfirm={handleSubsidizedConfirm}
			/>
		</div>
	);
}

export default function CheckoutPage() {
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
			<CheckoutContent />
		</Suspense>
	);
}
