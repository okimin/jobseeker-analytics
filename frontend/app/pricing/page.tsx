"use client";

import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Button } from "@heroui/react";

import { Navbar } from "@/components/navbar";
import SettingsModal from "@/components/SettingsModal";

const PREMIUM_AMOUNT_CENTS = 500; // $5/month

export default function PricingPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [isPremium, setIsPremium] = useState(false);
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

	useEffect(() => {
		const fetchPremiumStatus = async () => {
			try {
				const response = await fetch(`${apiUrl}/settings/premium-status`, {
					credentials: "include"
				});
				if (response.ok) {
					const data = await response.json();
					setIsPremium(data.is_premium);
				}
			} catch (err) {
				// Silently fail - user may not be logged in
			}
		};
		fetchPremiumStatus();
	}, [apiUrl]);

	const handleUpgrade = async () => {
		setIsLoading(true);

		try {
			const response = await fetch(`${apiUrl}/payment/checkout`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amount_cents: PREMIUM_AMOUNT_CENTS,
					trigger_type: "pricing_page",
					is_recurring: true
				})
			});

			if (response.ok) {
				const data = await response.json();
				window.open(data.checkout_url, "_blank", "noopener,noreferrer");
			} else {
				console.error("Failed to create checkout session");
			}
		} catch (error) {
			console.error("Upgrade error:", error);
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
									<span className="text-4xl font-bold text-gray-800 dark:text-white">$5</span>
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
									{isPremium ? (
										<Button
											className="w-full"
											color="primary"
											variant="bordered"
											onPress={() => setIsSettingsOpen(true)}
										>
											Manage Subscription
										</Button>
									) : (
										<Button
											className="w-full"
											color="primary"
											isLoading={isLoading}
											onPress={handleUpgrade}
										>
											Upgrade to Premium
										</Button>
									)}
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
									<span>
										<a
											className="underline"
											href="https://donate.stripe.com/fZu28r8Q98jSeGD8lFdIA00"
										>
											Any contribution
										</a>
									</span>{" "}
									helps keep the project running! You'll have access to all free features and can
									manually sync your emails anytime. Premium auto-sync is available at $5/month.
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
			<SettingsModal
				isOpen={isSettingsOpen}
				onClose={() => setIsSettingsOpen(false)}
			/>
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
