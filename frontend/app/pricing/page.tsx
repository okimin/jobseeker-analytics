"use client";

import React, { useState } from "react";
import { Card, CardBody, CardHeader, Button, Input } from "@heroui/react";

import { Navbar } from "@/components/navbar";

const PREMIUM_THRESHOLD = 5;

export default function PricingPage() {
	const [customAmount, setCustomAmount] = useState("5");
	const [isRecurring, setIsRecurring] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

	const getAmountCents = () => {
		const parsed = parseFloat(customAmount);
		if (isNaN(parsed) || parsed < 1) return 500;
		return Math.round(parsed * 100);
	};

	const isValidAmount = () => {
		const parsed = parseFloat(customAmount);
		return !isNaN(parsed) && parsed >= 1;
	};

	const isPremiumAmount = () => getAmountCents() >= PREMIUM_THRESHOLD * 100;

	const handleSupport = async () => {
		if (!isValidAmount()) return;

		setIsLoading(true);
		const amountCents = getAmountCents();

		try {
			const response = await fetch(`${apiUrl}/payment/checkout`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amount_cents: amountCents,
					trigger_type: "pricing_page",
					is_recurring: isRecurring
				})
			});

			if (response.ok) {
				const data = await response.json();
				window.open(data.checkout_url, "_blank", "noopener,noreferrer");
			} else {
				console.error("Failed to create checkout session");
			}
		} catch (error) {
			console.error("Support error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col min-h-screen">
			<Navbar />
			<main className="flex-grow bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
				<div className="container mx-auto px-4 py-12">
					{/* Header */}
					<div className="text-center mb-12">
						<h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">Pricing</h1>
						<p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
							JustAJobApp is free to start. Support us to unlock premium features and keep this tool free
							for those who need it.
						</p>
					</div>

					{/* Pricing Cards */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
						{/* Free Tier */}
						<Card className="border-2 border-default-200">
							<CardHeader className="flex flex-col items-center pt-8 pb-4">
								<h2 className="text-2xl font-bold text-gray-800 dark:text-white">Free</h2>
								<div className="mt-4">
									<span className="text-4xl font-bold text-gray-800 dark:text-white">$0</span>
									<span className="text-gray-500 dark:text-gray-400">/month</span>
								</div>
							</CardHeader>
							<CardBody className="px-6 pb-8">
								<ul className="space-y-3">
									<li className="flex items-start gap-2">
										<CheckIcon className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
										<span className="text-gray-600 dark:text-gray-300">Track job applications</span>
									</li>
									<li className="flex items-start gap-2">
										<CheckIcon className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
										<span className="text-gray-600 dark:text-gray-300">Gmail integration</span>
									</li>
									<li className="flex items-start gap-2">
										<CheckIcon className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
										<span className="text-gray-600 dark:text-gray-300">Manual sync anytime</span>
									</li>
									<li className="flex items-start gap-2">
										<XIcon className="w-5 h-5 text-default-400 mt-0.5 flex-shrink-0" />
										<span className="text-gray-400 dark:text-gray-500">
											Automatic background sync
										</span>
									</li>
								</ul>
								<div className="mt-6">
									<Button as="a" className="w-full" color="default" href="/signup" variant="bordered">
										Get Started
									</Button>
								</div>
							</CardBody>
						</Card>

						{/* Premium Tier */}
						<Card className="border-2 border-primary shadow-lg scale-105">
							<div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
								Most Popular
							</div>
							<CardHeader className="flex flex-col items-center pt-6 pb-4">
								<h2 className="text-2xl font-bold text-gray-800 dark:text-white">Premium</h2>
								<div className="mt-4">
									<span className="text-4xl font-bold text-gray-800 dark:text-white">$5+</span>
									<span className="text-gray-500 dark:text-gray-400">/month</span>
								</div>
							</CardHeader>
							<CardBody className="px-6 pb-8">
								<ul className="space-y-3">
									<li className="flex items-start gap-2">
										<CheckIcon className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
										<span className="text-gray-600 dark:text-gray-300">Everything in Free</span>
									</li>
									<li className="flex items-start gap-2">
										<CheckIcon className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
										<span className="text-gray-600 dark:text-gray-300 font-medium">
											Automatic sync every 12 hours
										</span>
									</li>
									<li className="flex items-start gap-2">
										<CheckIcon className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
										<span className="text-gray-600 dark:text-gray-300">Your data stays fresh</span>
									</li>
									<li className="flex items-start gap-2">
										<CheckIcon className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
										<span className="text-gray-600 dark:text-gray-300">Support open source</span>
									</li>
								</ul>
								<div className="mt-6">
									<Button
										className="w-full"
										color="primary"
										isLoading={isLoading}
										onPress={handleSupport}
									>
										Support with ${customAmount}/mo
									</Button>
								</div>
							</CardBody>
						</Card>

						{/* Coach Tier */}
						<Card className="border-2 border-default-200">
							<CardHeader className="flex flex-col items-center pt-8 pb-4">
								<h2 className="text-2xl font-bold text-gray-800 dark:text-white">Career Coach</h2>
								<div className="mt-4">
									<span className="text-4xl font-bold text-gray-800 dark:text-white">Includes</span>
								</div>
							</CardHeader>
							<CardBody className="px-6 pb-8">
								<ul className="space-y-3">
									<li className="flex items-start gap-2">
										<CheckIcon className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
										<span className="text-gray-600 dark:text-gray-300">Everything in Premium</span>
									</li>
									<li className="flex items-start gap-2">
										<CheckIcon className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
										<span className="text-gray-600 dark:text-gray-300">Access to client data</span>
									</li>
									<li className="flex items-start gap-2">
										<CheckIcon className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
										<span className="text-gray-600 dark:text-gray-300">
											Automatic sync every 12 hours
										</span>
									</li>
									<li className="flex items-start gap-2">
										<CheckIcon className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
										<span className="text-gray-600 dark:text-gray-300">White glove support</span>
									</li>
								</ul>
								<div className="mt-6">
									<Button
										as="a"
										className="w-full"
										color="default"
										href="/coaches"
										variant="bordered"
									>
										Learn More
									</Button>
								</div>
							</CardBody>
						</Card>
					</div>

					{/* Custom Amount Section */}
					<div className="max-w-lg mx-auto">
						<Card className="bg-white dark:bg-gray-800">
							<CardBody className="p-8">
								<h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 text-center">
									Choose Your Amount
								</h3>
								<p className="text-gray-600 dark:text-gray-300 text-sm text-center mb-6">
									Pay what you want. $5+/month unlocks automatic syncing.
								</p>

								{/* Amount Input */}
								<div className="flex items-center justify-center gap-2 mb-4">
									<span className="text-2xl text-gray-600 dark:text-gray-300">$</span>
									<Input
										className="max-w-24"
										min={1}
										size="lg"
										type="number"
										value={customAmount}
										variant="bordered"
										onChange={(e) => setCustomAmount(e.target.value)}
									/>
									<span className="text-gray-500 dark:text-gray-400">
										{isRecurring ? "/month" : "one-time"}
									</span>
								</div>

								{/* One-time vs Monthly Toggle */}
								<div className="flex gap-2 mb-6">
									<button
										className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
											!isRecurring
												? "border-primary bg-primary text-primary-foreground"
												: "border-default-300 text-gray-600 dark:text-gray-300 hover:border-default-400"
										}`}
										type="button"
										onClick={() => setIsRecurring(false)}
									>
										One-time
									</button>
									<button
										className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
											isRecurring
												? "border-primary bg-primary text-primary-foreground"
												: "border-default-300 text-gray-600 dark:text-gray-300 hover:border-default-400"
										}`}
										type="button"
										onClick={() => setIsRecurring(true)}
									>
										Monthly
									</button>
								</div>

								{/* Premium benefit indicator */}
								{isRecurring && isPremiumAmount() && (
									<div className="mb-4 p-3 bg-success/10 rounded-lg border border-success/20">
										<p className="text-sm text-success-600 dark:text-success-400 font-medium text-center">
											Includes automatic sync every 12 hours
										</p>
									</div>
								)}

								{isRecurring && !isPremiumAmount() && (
									<div className="mb-4 p-3 bg-default-100 rounded-lg">
										<p className="text-sm text-default-600 text-center">
											Tip: $5+/month unlocks automatic syncing
										</p>
									</div>
								)}

								<Button
									className="w-full"
									color="primary"
									isDisabled={!isValidAmount()}
									isLoading={isLoading}
									size="lg"
									onPress={handleSupport}
								>
									{isLoading
										? "Processing..."
										: `Support with $${customAmount}${isRecurring ? "/mo" : ""}`}
								</Button>
							</CardBody>
						</Card>
					</div>

					{/* FAQ Section */}
					<div className="max-w-2xl mx-auto mt-16">
						<h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8 text-center">
							Frequently Asked Questions
						</h2>
						<div className="space-y-6">
							<div>
								<h3 className="font-semibold text-gray-800 dark:text-white mb-2">
									What does automatic sync do?
								</h3>
								<p className="text-gray-600 dark:text-gray-300">
									With automatic sync, we check your email every 12 hours for new job application
									updates. Your dashboard stays current without you having to manually refresh.
								</p>
							</div>
							<div>
								<h3 className="font-semibold text-gray-800 dark:text-white mb-2">
									Can I cancel anytime?
								</h3>
								<p className="text-gray-600 dark:text-gray-300">
									Yes! You can cancel your monthly support at any time. You'll keep premium features
									until the end of your billing period.
								</p>
							</div>
							<div>
								<h3 className="font-semibold text-gray-800 dark:text-white mb-2">
									What if I contribute less than $5/month?
								</h3>
								<p className="text-gray-600 dark:text-gray-300">
									Any contribution helps keep the project running! You'll have access to all free
									features and can manually sync your emails anytime. Premium auto-sync is available
									at $5+/month.
								</p>
							</div>
							<div>
								<h3 className="font-semibold text-gray-800 dark:text-white mb-2">
									I'm working with a career coach. Do I need to pay?
								</h3>
								<p className="text-gray-600 dark:text-gray-300">
									No! If your coach has added you as a client, you automatically get premium features
									including automatic sync at no extra cost.
								</p>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}

function CheckIcon({ className }: { className?: string }) {
	return (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
		</svg>
	);
}

function XIcon({ className }: { className?: string }) {
	return (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
		</svg>
	);
}
