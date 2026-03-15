"use client";

import { useState, useMemo } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";

const PRESETS = [
	{ value: "1_week", label: "Last week" },
	{ value: "1_month", label: "Last month" },
	{ value: "3_months", label: "3 months" }
];

interface ChangeStartDateModalProps {
	isOpen: boolean;
	currentDate: string | null;
	isLoading: boolean;
	isPremium?: boolean;
	onClose: () => void;
	onSave: (data: { preset: string; custom_date?: string; fetch_order: string; end_date: string | null }) => void;
}

export default function ChangeStartDateModal({
	isOpen,
	currentDate,
	isLoading,
	isPremium,
	onClose,
	onSave
}: ChangeStartDateModalProps) {
	const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
	const [customDate, setCustomDate] = useState(currentDate ? currentDate.split("T")[0] : "");
	const [fetchOrder, setFetchOrder] = useState<string>("recent_first");
	const [endDate, setEndDate] = useState<string>("");

	// Compute the effective selected date (from preset or custom input)
	const effectiveDate = useMemo(() => {
		if (selectedPreset) {
			const daysMap: Record<string, number> = { "1_week": 7, "1_month": 30, "3_months": 90 };
			const days = daysMap[selectedPreset];
			if (days) {
				const d = new Date();
				d.setDate(d.getDate() - days);
				return d.toISOString().split("T")[0];
			}
		}
		return customDate || "";
	}, [selectedPreset, customDate]);

	// Show fetch order toggle only when selected start date is more than 30 days ago
	const isOldDate = useMemo(() => {
		if (!effectiveDate) return false;
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
		return new Date(effectiveDate) < thirtyDaysAgo;
	}, [effectiveDate]);

	const handleSave = () => {
		if (selectedPreset) {
			onSave({ preset: selectedPreset, fetch_order: fetchOrder, end_date: endDate || null });
		} else if (customDate) {
			onSave({ preset: "custom", custom_date: customDate, fetch_order: fetchOrder, end_date: endDate || null });
		}
	};

	const isValid = selectedPreset || customDate;

	return (
		<Modal data-testid="start-date-modal" isOpen={isOpen} onClose={onClose}>
			<ModalContent>
				<ModalHeader className="flex flex-col gap-1">Change job search start date</ModalHeader>
				<ModalBody>
					<p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
						We&apos;ll scan for applications after this date.
					</p>

					{/* Presets */}
					<div className="flex gap-2 mb-4">
						{PRESETS.map((preset) => (
							<button
								key={preset.value}
								className={`flex-1 py-2 px-3 rounded-lg border text-sm transition-colors ${
									selectedPreset === preset.value
										? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
										: "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
								}`}
								onClick={() => {
									setSelectedPreset(preset.value);
									setCustomDate("");
								}}
							>
								{preset.label}
							</button>
						))}
					</div>

					{/* Custom date picker */}
					<div className="mb-4">
						<label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
							Or choose a specific date:
						</label>
						<input
							className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
							max={new Date().toISOString().split("T")[0]}
							type="date"
							value={customDate}
							onChange={(e) => {
								setCustomDate(e.target.value);
								setSelectedPreset(null);
							}}
						/>
					</div>

					{/* End date picker */}
					<div className="mt-3">
						<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
							End date (optional)
						</label>
						<input
							className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
							max={new Date().toISOString().split("T")[0]}
							min={effectiveDate || ""}
							type="date"
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
						/>
						<p className="text-xs text-gray-500 mt-1">Leave blank to scan through today</p>
					</div>

					{/* Fetch order toggle — only shown when start date is older than 30 days */}
					{isOldDate && (
						<div className="mt-3">
							<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
								Process order
							</label>
							<div className="flex gap-2 mt-1">
								<button
									className={`flex-1 py-2 px-3 rounded-lg border text-sm transition-colors ${
										fetchOrder === "recent_first"
											? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
											: "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
									}`}
									onClick={() => setFetchOrder("recent_first")}
								>
									Recent first
								</button>
								<button
									className={`flex-1 py-2 px-3 rounded-lg border text-sm transition-colors ${
										fetchOrder === "oldest_first"
											? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
											: "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
									}`}
									onClick={() => setFetchOrder("oldest_first")}
								>
									Oldest first
								</button>
							</div>
							<p className="text-xs text-gray-500 mt-1">
								{fetchOrder === "oldest_first"
									? "Processes emails starting from your start date forward."
									: "Processes your most recent emails first."}
							</p>
							{!isPremium && fetchOrder === "oldest_first" && (
								<p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
									As a free user, you&apos;ll see emails from your start date through the next 30
									days.
								</p>
							)}
						</div>
					)}

					{/* Warning */}
					<p className="text-sm text-amber-600 dark:text-amber-400 mt-4">
						Changing this will rescan your inbox.
					</p>
				</ModalBody>
				<ModalFooter>
					<Button color="default" disabled={isLoading} variant="light" onPress={onClose}>
						Cancel
					</Button>
					<Button color="primary" disabled={!isValid || isLoading} isLoading={isLoading} onPress={handleSave}>
						Save & Rescan
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
