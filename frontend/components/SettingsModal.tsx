"use client";

import { useState, useEffect } from "react";
import {
	Button,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Spinner,
	RadioGroup,
	Radio
} from "@heroui/react";
import posthog from "posthog-js";

interface PremiumStatus {
	is_premium: boolean;
	premium_reason: "coach" | "coach_client" | "paid" | null;
	monthly_contribution_cents: number;
	stripe_subscription_id: string | null;
	has_valid_credentials: boolean;
	last_background_sync_at: string | null;
	contribution_started_at: string | null;
	cancel_at_period_end: boolean;
	subscription_ends_at: number | null;
	subscription_renews_at: number | null;
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
	const [showCancelSuccess, setShowCancelSuccess] = useState(false);
	const [cancelReason, setCancelReason] = useState<string>("");
	const [cancelReasonOther, setCancelReasonOther] = useState<string>("");
	const [completedCancelReason, setCompletedCancelReason] = useState<string>("");
	const [billingPeriodEnd, setBillingPeriodEnd] = useState<string | null>(null);

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
				return "";
			default:
				return "";
		}
	};

	const getCancelSuccessMessage = (reason: string, periodEnd: string | null): { title: string; message: string } => {
		const benefitsNote = periodEnd
			? `You'll keep your premium benefits through ${periodEnd}.`
			: "You'll keep your premium benefits until the end of your billing period.";
		switch (reason) {
			case "landed_job":
				return {
					title: "Congrats on the new role! 🎉",
					message: `Your contribution has been cancelled. ${benefitsNote} Thanks for being part of the community — if you ever find yourself searching again, we'll be here.`
				};
			case "not_using":
				return {
					title: "Got it",
					message: `Your contribution has been cancelled. ${benefitsNote} You can still use the free features anytime.`
				};
			case "too_expensive":
				return {
					title: "Totally understand",
					message: `Your contribution has been cancelled. ${benefitsNote} You can still use the free features anytime — we want you to have the tools you need regardless.`
				};
			default:
				return {
					title: "Subscription cancelled",
					message: `Your contribution has been cancelled. ${benefitsNote} You can still use the free features anytime. We hope your job search goes well — and if things change, we'd love to have you back.`
				};
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
				const data = await response.json();
				posthog.capture("subscription_cancelled", {
					amount_cents: status?.monthly_contribution_cents,
					reason: cancelReason || "not_specified",
					reason_other: cancelReason === "other" ? cancelReasonOther : undefined
				});
				// Store the reason and period end date for the success message
				setCompletedCancelReason(cancelReason);
				if (data.period_end_timestamp) {
					const endDate = new Date(data.period_end_timestamp * 1000);
					setBillingPeriodEnd(endDate.toLocaleDateString());
				}
				setShowCancelConfirm(false);
				setShowCancelSuccess(true);
				setCancelReason("");
				setCancelReasonOther("");
				// Don't refresh status yet - user still has premium until period ends
				onSubscriptionChange?.();
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
		setShowCancelSuccess(false);
		setCompletedCancelReason("");
		setBillingPeriodEnd(null);
		setError(null);
		onClose();
	};

	return (
		<Modal isOpen={isOpen} size="lg" onClose={handleClose}>
			<ModalContent>
				<ModalHeader className="flex flex-col gap-1">Settings</ModalHeader>
				<ModalBody>
					{showCancelSuccess ? (
						<div className="py-4">
							<div className="text-center mb-6">
								<div className="text-4xl mb-4">
									{completedCancelReason === "landed_job" ? "🎉" : "👋"}
								</div>
								<h3 className="text-lg font-semibold text-foreground mb-3">
									{getCancelSuccessMessage(completedCancelReason, billingPeriodEnd).title}
								</h3>
								<p className="text-sm text-foreground/70 leading-relaxed">
									{getCancelSuccessMessage(completedCancelReason, billingPeriodEnd).message}
								</p>
								<br />
								<p className="text-sm text-foreground/70 leading-relaxed underline">
									<a href="mailto:help@justajobapp.com">
										Got questions or feedback? Email us at help@justajobapp.com
									</a>
								</p>
							</div>
							<div className="flex justify-center">
								<Button color="primary" onPress={handleClose}>
									Done
								</Button>
							</div>
						</div>
					) : loading ? (
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
							{/* Plan Status with integrated subscription info */}
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
								{status.premium_reason === "paid" && status.stripe_subscription_id ? (
									<>
										{showCancelConfirm ? (
											<div className="space-y-4 mt-3">
												<p className="text-sm font-medium text-foreground">
													Cancel your contribution
												</p>
												<p className="text-sm text-foreground/70">
													We&apos;re sorry to see you go! If you have a sec, let us know why —
													it helps us improve.
												</p>
												<RadioGroup
													size="sm"
													value={cancelReason}
													onValueChange={setCancelReason}
												>
													<Radio value="landed_job">I landed a job 🎉</Radio>
													<Radio value="not_using">Not using the app enough</Radio>
													<Radio value="too_expensive">Too expensive right now</Radio>
													<Radio value="other">Other</Radio>
												</RadioGroup>
												{cancelReason === "other" && (
													<input
														className="w-full px-3 py-2 text-sm rounded-lg border border-default-300 bg-default-100 focus:outline-none focus:ring-2 focus:ring-primary"
														placeholder="Tell us more (optional)"
														type="text"
														value={cancelReasonOther}
														onChange={(e) => setCancelReasonOther(e.target.value)}
													/>
												)}
												<div className="flex gap-2 pt-2">
													<Button
														color="default"
														isDisabled={isCancelling}
														size="sm"
														variant="light"
														onPress={() => {
															setShowCancelConfirm(false);
															setCancelReason("");
															setCancelReasonOther("");
														}}
													>
														Keep subscription
													</Button>
													<Button
														color="danger"
														isLoading={isCancelling}
														size="sm"
														onPress={handleCancelSubscription}
													>
														Confirm cancellation
													</Button>
												</div>
											</div>
										) : status.cancel_at_period_end && status.subscription_ends_at ? (
											<div className="space-y-2">
												<div className="flex items-center justify-between">
													<p className="text-sm text-default-500">
														${(status.monthly_contribution_cents / 100).toFixed(0)}/month
													</p>
												</div>
												<p className="text-sm text-warning-600 dark:text-warning-400">
													Subscription ends{" "}
													{new Date(status.subscription_ends_at * 1000).toLocaleDateString()}
												</p>
											</div>
										) : (
											<div className="space-y-2">
												<div className="flex items-center justify-between">
													<p className="text-sm text-default-500">
														${(status.monthly_contribution_cents / 100).toFixed(0)}/month
														{status.subscription_renews_at && (
															<span className="text-default-400">
																{" "}· Renews{" "}
																{new Date(status.subscription_renews_at * 1000).toLocaleDateString()}
															</span>
														)}
													</p>
													<button
														className="text-sm text-default-400 hover:text-danger hover:underline"
														disabled={isCancelling}
														onClick={() => setShowCancelConfirm(true)}
													>
														Cancel
													</button>
												</div>
											</div>
										)}
									</>
								) : status.is_premium && status.premium_reason ? (
									<p className="text-sm text-success-600 dark:text-success-400">
										{getPremiumReasonText(status.premium_reason)}
									</p>
								) : !status.is_premium ? (
									<p className="text-sm text-default-500">
										Upgrade to unlock automatic background sync
									</p>
								) : null}
							</div>

							{/* Background Sync */}
							<div className="border-t border-divider pt-4">
								<div className="flex items-center justify-between">
									<div className={!status.is_premium ? "opacity-50" : ""}>
										<p className="font-medium">Background sync</p>
										<p className="text-sm text-default-500">
											Emails sync automatically every 12 hours
										</p>
									</div>
									{status.is_premium ? (
										<span className="text-sm text-success-600 dark:text-success-400">
											✓ Included
										</span>
									) : (
										<Button
											color="primary"
											isLoading={isUpgrading}
											size="sm"
											onPress={handleUpgrade}
										>
											Upgrade
										</Button>
									)}
								</div>
							</div>

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
