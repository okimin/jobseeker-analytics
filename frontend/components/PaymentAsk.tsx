"use client";

import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@heroui/react";

interface PaymentAskProps {
	isOpen: boolean;
	onClose: () => void;
	triggerType: string;
}

const PRICE_OPTIONS = [
	{ cents: 0, label: "$0", description: "I can't pay right now" },
	{ cents: 500, label: "$5", description: "Buy the team a coffee" },
	{ cents: 1000, label: "$10", description: "Support development" },
	{ cents: 2000, label: "$20", description: "Help us build more features" }
];

export default function PaymentAsk({ isOpen, onClose, triggerType }: PaymentAskProps) {
	const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
	const [selectedCents, setSelectedCents] = useState(1000);
	const [customAmount, setCustomAmount] = useState("");
	const [isCustom, setIsCustom] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleOptionSelect = (cents: number) => {
		setSelectedCents(cents);
		setIsCustom(false);
		setCustomAmount("");
	};

	const handleCustomChange = (value: string) => {
		setCustomAmount(value);
		setIsCustom(true);
		const parsed = parseFloat(value);
		if (!isNaN(parsed) && parsed >= 1) {
			setSelectedCents(Math.round(parsed * 100));
		}
	};

	const handleContinue = async () => {
		setIsLoading(true);

		try {
			// Record the action
			await fetch(`${apiUrl}/payment/ask-action`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "selected",
					selected_amount_cents: selectedCents
				})
			});

			if (selectedCents === 0) {
				onClose();
				return;
			}

			// Create checkout session
			const response = await fetch(`${apiUrl}/payment/checkout`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amount_cents: selectedCents,
					trigger_type: triggerType
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
			console.error("Payment error:", error);
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

	return (
		<Modal
			data-testid="payment-ask-modal"
			isOpen={isOpen}
			placement="center"
			size="lg"
			onOpenChange={(open) => {
				if (!open && !isLoading) {
					handleMaybeLater();
				}
			}}
		>
			<ModalContent>
				<ModalHeader className="flex flex-col gap-1 text-center">
					JustAJobApp is funded by people like you
				</ModalHeader>
				<ModalBody>
					<p className="text-gray-600 dark:text-gray-300 text-center mb-4">Pay what you can. $0 is okay.</p>

					<div className="space-y-2">
						{PRICE_OPTIONS.map((option) => (
							<button
								key={option.cents}
								className={`w-full p-3 rounded-lg border text-left flex justify-between items-center transition-colors ${
									selectedCents === option.cents && !isCustom
										? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
										: "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
								} ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
								disabled={isLoading}
								type="button"
								onClick={() => handleOptionSelect(option.cents)}
							>
								<span className="font-medium">{option.label}/mo</span>
								<span className="text-gray-500 dark:text-gray-400 text-sm">{option.description}</span>
							</button>
						))}

						{/* Custom amount */}
						<div
							className={`flex items-center gap-2 p-3 border rounded-lg transition-colors ${
								isCustom
									? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
									: "border-gray-200 dark:border-gray-700"
							}`}
						>
							<span className="text-gray-600 dark:text-gray-300">$</span>
							<Input
								classNames={{
									input: "bg-transparent",
									inputWrapper: "bg-transparent shadow-none"
								}}
								disabled={isLoading}
								min={1}
								placeholder="Custom amount"
								type="number"
								value={customAmount}
								onChange={(e) => handleCustomChange(e.target.value)}
							/>
							<span className="text-gray-500 dark:text-gray-400">/mo</span>
						</div>
					</div>

					<p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
						Everyone gets the same features. Cancel anytime.
					</p>
				</ModalBody>
				<ModalFooter className="flex gap-3">
					<Button
						className="flex-1"
						color="default"
						isDisabled={isLoading}
						variant="light"
						onPress={handleMaybeLater}
					>
						Maybe later
					</Button>
					<Button
						className="flex-1"
						color="primary"
						isDisabled={isLoading || (isCustom && (selectedCents < 100 || isNaN(selectedCents)))}
						isLoading={isLoading}
						onPress={handleContinue}
					>
						{isLoading ? "Processing..." : "Continue"}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
