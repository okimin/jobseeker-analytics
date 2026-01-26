"use client";

import { useState, useEffect } from "react";
import { Button, Input } from "@heroui/react";

interface SupportBannerProps {
	isVisible: boolean;
	onClose: () => void;
	triggerType: string;
}

const DEFAULT_AMOUNT_CENTS = 500; // $5

export default function SupportBanner({ isVisible, onClose, triggerType }: SupportBannerProps) {
	const [isAnimating, setIsAnimating] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [customAmount, setCustomAmount] = useState("5");
	const [isRecurring, setIsRecurring] = useState(true);
	const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

	useEffect(() => {
		if (isVisible) {
			// Small delay for entrance animation
			const timer = setTimeout(() => setIsAnimating(true), 100);
			return () => clearTimeout(timer);
		} else {
			setIsAnimating(false);
		}
	}, [isVisible]);

	const getAmountCents = () => {
		const parsed = parseFloat(customAmount);
		if (isNaN(parsed) || parsed < 1) return DEFAULT_AMOUNT_CENTS;
		return Math.round(parsed * 100);
	};

	const isValidAmount = () => {
		const parsed = parseFloat(customAmount);
		return !isNaN(parsed) && parsed >= 1;
	};

	const handleSupport = async () => {
		if (!isValidAmount()) return;

		setIsLoading(true);
		const amountCents = getAmountCents();

		try {
			// Record the action
			await fetch(`${apiUrl}/payment/ask-action`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "selected",
					selected_amount_cents: amountCents
				})
			});

			// Create checkout session
			const response = await fetch(`${apiUrl}/payment/checkout`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amount_cents: amountCents,
					trigger_type: triggerType,
					is_recurring: isRecurring
				})
			});

			if (response.ok) {
				const data = await response.json();
				window.location.href = data.checkout_url;
			} else {
				console.error("Failed to create checkout session");
				setIsLoading(false);
			}
		} catch (error) {
			console.error("Support error:", error);
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

	const amountCents = getAmountCents();
	const displayAmount = (amountCents / 100).toFixed(amountCents % 100 === 0 ? 0 : 2);

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

				{/* Heart icon and headline */}
				<div className="flex items-center gap-2 mb-3">
					<span className="text-2xl">
						<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
							<path
								clipRule="evenodd"
								d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
								fillRule="evenodd"
							/>
						</svg>
					</span>
					<h3 className="text-lg font-semibold text-foreground">Help keep this free</h3>
				</div>

				{/* Emotional message */}
				<p className="text-foreground/70 text-sm mb-4">
					Job searching is hard. Your support helps us keep this tool free for the next person who needs it.
				</p>

				{/* Amount input */}
				<div className="mb-3">
					<label className="block text-sm font-medium text-foreground/80 mb-1">Amount</label>
					<div className="flex items-center gap-2">
						<span className="text-default-500">$</span>
						<Input
							className="max-w-24"
							color="default"
							disabled={isLoading}
							min={1}
							placeholder="5"
							size="sm"
							type="number"
							value={customAmount}
							variant="bordered"
							onChange={(e) => setCustomAmount(e.target.value)}
						/>
					</div>
					{!isValidAmount() && customAmount && (
						<p className="text-xs text-danger mt-1">Please enter an amount of at least $1</p>
					)}
				</div>

				{/* One-time vs Recurring toggle */}
				<div className="flex gap-2 mb-4">
					<button
						className={`flex-1 py-2 px-3 text-sm rounded-md border transition-colors ${
							!isRecurring
								? "border-primary bg-primary text-primary-foreground"
								: "border-divider text-foreground/60 hover:border-default-400 hover:text-foreground"
						}`}
						disabled={isLoading}
						type="button"
						onClick={() => setIsRecurring(false)}
					>
						One-time
					</button>
					<button
						className={`flex-1 py-2 px-3 text-sm rounded-md border transition-colors ${
							isRecurring
								? "border-primary bg-primary text-primary-foreground"
								: "border-divider text-foreground/60 hover:border-default-400 hover:text-foreground"
						}`}
						disabled={isLoading}
						type="button"
						onClick={() => setIsRecurring(true)}
					>
						Monthly
					</button>
				</div>

				{/* CTA */}
				<div className="flex flex-col gap-2">
					<Button
						className="w-full"
						color="primary"
						isDisabled={!isValidAmount()}
						isLoading={isLoading}
						onPress={handleSupport}
					>
						{isLoading ? "Processing..." : `Support with $${displayAmount}${isRecurring ? "/mo" : ""}`}
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
