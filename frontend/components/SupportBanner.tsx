"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import NextLink from "next/link";

interface SupportBannerProps {
	isVisible: boolean;
	onClose: () => void;
	triggerType: string;
}

const PREMIUM_AMOUNT_CENTS = 500; // $5/month for premium

export default function SupportBanner({ isVisible, onClose, triggerType }: SupportBannerProps) {
	const [isAnimating, setIsAnimating] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

	useEffect(() => {
		if (isVisible) {
			const timer = setTimeout(() => setIsAnimating(true), 100);
			return () => clearTimeout(timer);
		} else {
			setIsAnimating(false);
		}
	}, [isVisible]);

	const handleUpgrade = async () => {
		setIsLoading(true);

		try {
			// Record the action
			await fetch(`${apiUrl}/payment/ask-action`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "selected",
					selected_amount_cents: PREMIUM_AMOUNT_CENTS
				})
			});

			// Create checkout session
			const response = await fetch(`${apiUrl}/payment/checkout`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amount_cents: PREMIUM_AMOUNT_CENTS,
					trigger_type: triggerType,
					is_recurring: true
				})
			});

			if (response.ok) {
				const data = await response.json();
				window.open(data.checkout_url, "_blank", "noopener,noreferrer");
				onClose();
			} else {
				console.error("Failed to create checkout session");
				setIsLoading(false);
			}
		} catch (error) {
			console.error("Upgrade error:", error);
			setIsLoading(false);
		}
	};

	const handleMaybeLater = async () => {
		try {
			await fetch(`${apiUrl}/payment/ask-action`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "maybe_later" })
			});
		} catch (error) {
			console.error("Error recording maybe later:", error);
		}
		onClose();
	};

	if (!isVisible) return null;

	return (
		<div
			className={`fixed bottom-4 right-4 z-40 max-w-sm transition-all duration-300 ease-out ${
				isAnimating ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
			}`}
			data-testid="support-banner"
		>
			<div className="bg-content1 rounded-lg shadow-lg border border-divider p-5">
				{/* Close button */}
				<button
					aria-label="Dismiss"
					className="absolute top-2 right-2 text-default-400 hover:text-foreground"
					onClick={handleMaybeLater}
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
					</svg>
				</button>

				{/* Headline */}
				<h3 className="text-lg font-semibold text-foreground mb-3">Introducing Premium — $5/mo</h3>

				{/* Value proposition */}
				<p className="text-foreground/70 text-sm mb-4">
					Your data stays automatically synced so it's always up to date when you open the app.
				</p>

				{/* Learn more link */}
				<p className="text-xs text-default-500 mb-4">
					<NextLink className="underline hover:text-foreground" href="/pricing">
						See all premium features
					</NextLink>
				</p>

				{/* CTA */}
				<div className="flex flex-col gap-2">
					<Button className="w-full" color="primary" isLoading={isLoading} onPress={handleUpgrade}>
						{isLoading ? "Processing..." : "Upgrade to Premium"}
					</Button>
					<button
						className="text-sm text-default-500 hover:text-foreground"
						disabled={isLoading}
						onClick={handleMaybeLater}
					>
						Maybe later
					</button>
				</div>
			</div>
		</div>
	);
}
