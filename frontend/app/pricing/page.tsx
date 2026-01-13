"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addToast } from "@heroui/toast";

import { Navbar } from "@/components/navbar";
import PricingTable from "@/components/PricingTable";
import Spinner from "@/components/spinner";
import SubsidizedCommitment from "@/components/SubsidizedCommitment";
import { checkAuth } from "@/utils/auth";

export default function PricingPage() {
	const router = useRouter();
	const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [showCommitmentModal, setShowCommitmentModal] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		checkAuth(apiUrl).then(async (authenticated) => {
			setIsAuthenticated(authenticated);
			if (authenticated) {
				try {
					const response = await fetch(`${apiUrl}/api/users/onboarding-status`, {
						credentials: "include"
					});
					if (response.ok) {
						const data = await response.json();
						if (data.has_completed_onboarding) {
							if (data.has_email_sync_configured) {
								router.push("/dashboard");
							} else {
								router.push("/email-sync-setup");
							}
							return;
						}
						// User is authenticated but not onboarded - let them choose a tier here
					}
				} catch {
					// Continue showing pricing page on error
				}
			}
			setIsCheckingAuth(false);
		});
	}, [apiUrl, router]);

	const handleSelectTier = async (tier: string, customAmount?: number) => {
		console.log("[Pricing] handleSelectTier called:", { tier, isAuthenticated });

		if (tier === "subsidized") {
			// Show commitment modal for subsidized tier (regardless of auth status)
			console.log("[Pricing] Showing subsidized modal");
			setShowCommitmentModal(true);
			return;
		}

		// For other tiers, redirect to signup
		const params = new URLSearchParams({ tier });
		if (customAmount) {
			params.set("amount", String(customAmount));
		}
		router.push(`/signup?${params.toString()}`);
	};

	const handleSubsidizedConfirm = async () => {
		setIsLoading(true);

		if (!isAuthenticated) {
			// Unauthenticated user - mark commitment as confirmed and redirect to signup
			localStorage.setItem("subsidizedCommitmentConfirmed", "true");
			router.push("/signup?tier=subsidized");
			return;
		}

		// Authenticated user - complete onboarding directly
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
			console.error("Error:", error);
			addToast({
				title: "Something went wrong",
				description: error instanceof Error ? error.message : "Please try again.",
				color: "danger"
			});
			setShowCommitmentModal(false);
		} finally {
			setIsLoading(false);
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
					<PricingTable isLoading={isLoading} onSelectTier={handleSelectTier} />
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
