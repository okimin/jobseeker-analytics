"use client";

import { useState, useEffect } from "react";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Switch, Spinner } from "@heroui/react";
import NextLink from "next/link";
import posthog from "posthog-js";

interface PremiumStatus {
	is_premium: boolean;
	premium_reason: "coach" | "coach_client" | "paid" | null;
	monthly_contribution_cents: number;
	stripe_subscription_id: string | null;
	always_open_enabled: boolean;
	has_valid_credentials: boolean;
	last_background_sync_at: string | null;
}

interface SettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubscriptionChange?: () => void; // Callback to refresh parent state after subscription changes
}

const PREMIUM_AMOUNT_CENTS = 500; // $5/month for premium

export default function SettingsModal({ isOpen, onClose, onSubscriptionChange }: SettingsModalProps) {
	const [status, setStatus] = useState<PremiumStatus | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Subscription management state
	const [isCancelling, setIsCancelling] = useState(false);
	const [showCancelConfirm, setShowCancelConfirm] = useState(false);

	// Background sync state
	const [isSavingSync, setIsSavingSync] = useState(false);

	// Upgrade state
	const [isUpgrading, setIsUpgrading] = useState(false);

	const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

	// Fetch premium status when modal opens
	useEffect(() => {
		if (isOpen) {
			fetchPremiumStatus();
			posthog.capture("settings_modal_opened");
		}
	}, [isOpen]);

	const fetchPremiumStatus = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch(`${apiUrl}/settings/premium-status`, {
				credentials: "include"
			});
			if (response.ok) {
				const data = await response.json();
				setStatus(data);
			} else if (response.status === 401) {
				setError("Please log in to view settings");
			} else {
				setError("Failed to load settings");
			}
		} catch (err) {
			console.error("Error fetching premium status:", err);
			setError("Failed to load settings");
		} finally {
			setLoading(false);
		}
	};

	const getPremiumReasonText = (reason: string | null): string => {
		switch (reason) {
			case "coach":
				return "You have premium as a career coach";
			case "coach_client":
				return "You have premium through your career coach";
			case "paid":
				return "You have premium as a supporter";
			default:
				return "";
		}
	};

	const formatLastSync = (isoString: string | null): string => {
		if (!isoString) return "Never";
		const date = new Date(isoString);
		return date.toLocaleString();
	};

	// Background sync toggle
	const handleSyncToggle = async (enabled: boolean) => {
		if (!status?.has_valid_credentials) return;

		setIsSavingSync(true);
		try {
			const response = await fetch(`${apiUrl}/settings/always-open`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ enabled })
			});

			if (response.ok) {
				setStatus((prev) => (prev ? { ...prev, always_open_enabled: enabled } : null));
				posthog.capture("background_sync_toggled", { enabled });
			} else {
				const data = await response.json();
				setError(data.detail || "Failed to update setting");
			}
		} catch (err) {
			console.error("Error updating sync setting:", err);
			setError("Failed to update setting");
		} finally {
			setIsSavingSync(false);
		}
	};

	// Cancel subscription
	const handleCancelSubscription = async () => {
		setIsCancelling(true);
		setError(null);

		try {
			const response = await fetch(`${apiUrl}/payment/cancel`, {
				method: "POST",
				credentials: "include"
			});

			if (response.ok) {
				posthog.capture("subscription_cancelled", {
					amount_cents: status?.monthly_contribution_cents
				});
				await fetchPremiumStatus();
				onSubscriptionChange?.();
				setShowCancelConfirm(false);
			} else {
				const data = await response.json();
				setError(data.detail || "Failed to cancel subscription");
			}
		} catch (err) {
			console.error("Error cancelling subscription:", err);
			setError("Failed to cancel subscription");
		} finally {
			setIsCancelling(false);
		}
	};

	// Upgrade to premium
	const handleUpgrade = async () => {
		setIsUpgrading(true);
		setError(null);

		try {
			const response = await fetch(`${apiUrl}/payment/checkout`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amount_cents: PREMIUM_AMOUNT_CENTS,
					trigger_type: "settings_modal",
					is_recurring: true
				})
			});

			if (response.ok) {
				const data = await response.json();
				posthog.capture("upgrade_clicked", { source: "settings_modal" });
				window.open(data.checkout_url, "_blank", "noopener,noreferrer");
				onClose();
			} else {
				setError("Failed to start checkout");
			}
		} catch (err) {
			console.error("Error starting checkout:", err);
			setError("Failed to start checkout");
		} finally {
			setIsUpgrading(false);
		}
	};

	const handleClose = () => {
		if (isCancelling || isUpgrading) return;
		setShowCancelConfirm(false);
		setError(null);
		onClose();
	};

	return (
		<Modal isOpen={isOpen} size="lg" onClose={handleClose}>
			<ModalContent>
				<ModalHeader className="flex flex-col gap-1">Settings</ModalHeader>
				<ModalBody>
					{loading ? (
						<div className="flex justify-center py-8">
							<Spinner size="lg" />
						</div>
					) : error && !status ? (
						<div className="text-center py-8">
							<p className="text-danger">{error}</p>
							<Button className="mt-4" color="primary" variant="light" onPress={fetchPremiumStatus}>
								Retry
							</Button>
						</div>
					) : status ? (
						<div className="space-y-6">
							{/* Plan Status */}
							<div className="p-4 rounded-lg bg-default-100">
								<div className="flex items-center justify-between mb-2">
									<span className="font-medium">Your plan</span>
									<span
										className={`px-3 py-1 rounded-full text-sm font-medium ${
											status.is_premium
												? "bg-success/20 text-success-600 dark:text-success-400"
												: "bg-default-200 text-default-600"
										}`}
									>
										{status.is_premium ? "Premium" : "Free"}
									</span>
								</div>
								{status.is_premium && status.premium_reason && (
									<p className="text-sm text-success-600 dark:text-success-400">
										{getPremiumReasonText(status.premium_reason)}
									</p>
								)}
								{!status.is_premium && (
									<p className="text-sm text-default-500">
										Upgrade to unlock automatic background sync
									</p>
								)}
							</div>

							{/* Background Sync (for premium users) */}
							{status.is_premium && (
								<div className="border-t border-divider pt-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="font-medium">Background sync</p>
											<p className="text-sm text-default-500">
												Sync your emails automatically every 12 hours
											</p>
										</div>
										<Switch
											isDisabled={!status.has_valid_credentials || isSavingSync}
											isSelected={status.always_open_enabled}
											onValueChange={handleSyncToggle}
										/>
									</div>
									{!status.has_valid_credentials && (
										<p className="text-sm text-warning-600 dark:text-warning-400 mt-2">
											Reconnect your Google account on the{" "}
											<NextLink className="underline" href="/dashboard">
												Dashboard
											</NextLink>{" "}
											to enable sync.
										</p>
									)}
									{status.always_open_enabled && status.last_background_sync_at && (
										<p className="text-sm text-default-500 mt-2">
											Last sync: {formatLastSync(status.last_background_sync_at)}
										</p>
									)}
								</div>
							)}

							{/* Subscription Management (for paying users) */}
							{status.premium_reason === "paid" && status.stripe_subscription_id && (
								<div className="border-t border-divider pt-4">
									<p className="font-medium mb-3">Subscription</p>
									{showCancelConfirm ? (
										<div className="space-y-4">
											<p className="text-foreground/80">
												Are you sure you want to cancel? Your support helps keep this tool free
												for others.
											</p>
											<div className="flex gap-2">
												<Button
													color="default"
													isDisabled={isCancelling}
													variant="light"
													onPress={() => setShowCancelConfirm(false)}
												>
													Keep Subscription
												</Button>
												<Button
													color="danger"
													isLoading={isCancelling}
													onPress={handleCancelSubscription}
												>
													Yes, Cancel
												</Button>
											</div>
										</div>
									) : (
										<div className="space-y-4">
											<p className="text-sm text-default-500">
												You&apos;re contributing $
												{(status.monthly_contribution_cents / 100).toFixed(0)}/month. Thank you
												for your support!
											</p>
											<button
												className="text-sm text-danger hover:underline"
												disabled={isCancelling}
												onClick={() => setShowCancelConfirm(true)}
											>
												Cancel subscription
											</button>
										</div>
									)}
								</div>
							)}

							{/* Upgrade CTA (for free users) */}
							{!status.is_premium && (
								<div className="border-t border-divider pt-4">
									<div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
										<h3 className="font-semibold text-foreground mb-2">
											Upgrade to Premium — $5/mo
										</h3>
										<p className="text-sm text-foreground/70 mb-4">
											Your data stays automatically synced so it&apos;s always up to date when you
											open the app.
										</p>
										<div className="flex items-center gap-3">
											<Button color="primary" isLoading={isUpgrading} onPress={handleUpgrade}>
												Upgrade Now
											</Button>
											<NextLink
												className="text-sm text-default-500 hover:underline"
												href="/pricing"
											>
												See all features
											</NextLink>
										</div>
									</div>
								</div>
							)}

							{/* Error display */}
							{error && <p className="text-sm text-danger">{error}</p>}
						</div>
					) : null}
				</ModalBody>
				<ModalFooter>
					<Button color="default" variant="light" onPress={handleClose}>
						Close
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
