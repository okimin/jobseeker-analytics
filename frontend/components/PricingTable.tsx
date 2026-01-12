"use client";

import React, { useState } from "react";
import { Card, CardBody, CardHeader, Button, Input } from "@heroui/react";

interface PricingTier {
	id: string;
	name: string;
	price: number | "custom";
	description: string;
	features: string[];
	highlight?: boolean;
}

const PRICING_TIERS: PricingTier[] = [
	{
		id: "subsidized",
		name: "Subsidized",
		price: 0,
		description: "Fully covered by the community",
		features: ["Full access to all features", "Email sync & automation", "Dashboard & analytics"]
	},
	{
		id: "standard",
		name: "Standard",
		price: 12,
		description: "Cover your costs + 1 other person",
		features: ["Everything in Subsidized", "Support the community", "Help 1 other job seeker"],
		highlight: true
	},
	{
		id: "sustainer",
		name: "Sustainer",
		price: 25,
		description: "Cover your costs + 3 other people",
		features: ["Everything in Standard", "Maximum community impact", "Help 3 other job seekers"]
	},
	{
		id: "custom",
		name: "Custom",
		price: "custom",
		description: "Choose your own amount",
		features: ["Everything included", "Pay what feels right", "Any amount helps"]
	}
];

interface PricingTableProps {
	onSelectTier: (tier: string, customAmount?: number) => Promise<void>;
	isLoading?: boolean;
	preselectedTier?: string;
	preselectedAmount?: number;
}

export default function PricingTable({
	onSelectTier,
	isLoading = false,
	preselectedTier,
	preselectedAmount
}: PricingTableProps) {
	const [customAmount, setCustomAmount] = useState<string>(preselectedAmount ? String(preselectedAmount / 100) : "5");
	const [selectedTier, setSelectedTier] = useState<string | null>(null);
	const [error, setError] = useState<string>("");

	const handleSelect = async (tierId: string) => {
		setError("");
		setSelectedTier(tierId);

		if (tierId === "custom") {
			const amount = parseInt(customAmount) * 100; // Convert to cents
			if (isNaN(amount) || amount < 100) {
				setError("Minimum custom amount is $1");
				setSelectedTier(null);
				return;
			}
			await onSelectTier(tierId, amount);
		} else {
			await onSelectTier(tierId);
		}
		setSelectedTier(null);
	};

	return (
		<div className="w-full max-w-6xl mx-auto">
			<div className="text-center mb-12">
				<h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Solidarity Pricing</h2>
				<p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
					Pay what works for you. Those who can, help those who cannot. Everyone gets the same features.
				</p>
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				{PRICING_TIERS.map((tier) => (
					<Card
						key={tier.id}
						className={`${tier.highlight ? "border-2 border-emerald-500 shadow-lg" : ""} ${preselectedTier === tier.id ? "ring-2 ring-emerald-400" : ""}`}
					>
						<CardHeader className="flex flex-col gap-2 pb-0">
							<h3 className="text-xl font-semibold">{tier.name}</h3>
							<div className="flex items-baseline gap-1">
								{tier.price === "custom" ? (
									<span className="text-2xl font-bold">Custom</span>
								) : (
									<>
										<span className="text-3xl font-bold">${tier.price}</span>
										<span className="text-gray-500">/month</span>
									</>
								)}
							</div>
							<p className="text-sm text-gray-500">{tier.description}</p>
						</CardHeader>
						<CardBody className="pt-4">
							<ul className="space-y-2 mb-6">
								{tier.features.map((feature, idx) => (
									<li key={idx} className="flex items-center gap-2 text-sm">
										<svg
											className="w-4 h-4 text-emerald-500 flex-shrink-0"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												clipRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												fillRule="evenodd"
											/>
										</svg>
										{feature}
									</li>
								))}
							</ul>

							{tier.id === "custom" && (
								<div className="mb-4">
									<Input
										errorMessage={error}
										isInvalid={error !== "" && selectedTier === "custom"}
										label="Amount ($)"
										min={1}
										placeholder="5"
										type="number"
										value={customAmount}
										onChange={(e) => setCustomAmount(e.target.value)}
									/>
								</div>
							)}

							<Button
								className={`w-full ${tier.highlight ? "bg-emerald-600 text-white" : ""}`}
								color={tier.highlight ? "success" : "default"}
								isDisabled={isLoading}
								isLoading={isLoading && selectedTier === tier.id}
								variant={tier.highlight ? "solid" : "bordered"}
								onPress={() => handleSelect(tier.id)}
							>
								{tier.price === 0 ? "Get Started Free" : "Select Plan"}
							</Button>
						</CardBody>
					</Card>
				))}
			</div>
		</div>
	);
}
