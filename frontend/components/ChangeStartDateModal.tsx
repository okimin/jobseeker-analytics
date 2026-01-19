"use client";

import { useState } from "react";
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
	onClose: () => void;
	onSave: (data: { preset: string; custom_date?: string }) => void;
}

export default function ChangeStartDateModal({
	isOpen,
	currentDate,
	isLoading,
	onClose,
	onSave
}: ChangeStartDateModalProps) {
	const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
	const [customDate, setCustomDate] = useState(currentDate ? currentDate.split("T")[0] : "");

	const handleSave = () => {
		if (selectedPreset) {
			onSave({ preset: selectedPreset });
		} else if (customDate) {
			onSave({ preset: "custom", custom_date: customDate });
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

					{/* Warning */}
					<p className="text-sm text-amber-600 dark:text-amber-400">
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
