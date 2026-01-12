"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Navbar } from "@/components/navbar";
import PricingTable from "@/components/PricingTable";
import Spinner from "@/components/spinner";
import { checkAuth } from "@/utils/auth";

export default function PricingPage() {
	const router = useRouter();
	const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);

	useEffect(() => {
		// Check for existing session - redirect authenticated users
		checkAuth(apiUrl).then(async (authenticated) => {
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
						} else {
							router.push("/onboarding");
							return;
						}
					}
				} catch {
					// Continue showing pricing page on error
				}
			}
			setIsCheckingAuth(false);
		});
	}, [apiUrl, router]);

	const handleSelectTier = async (tier: string, customAmount?: number) => {
		// Redirect to signup with selected tier (bypasses beta access)
		const params = new URLSearchParams({ tier });
		if (customAmount) {
			params.set("amount", String(customAmount));
		}
		router.push(`/signup?${params.toString()}`);
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
					<PricingTable onSelectTier={handleSelectTier} />
				</div>
			</main>
		</div>
	);
}
