"use client";

import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";

interface SubsidizedCommitmentProps {
	isOpen: boolean;
	onConfirm: () => Promise<void>;
	onCancel: () => void;
}

export default function SubsidizedCommitment({ isOpen, onConfirm, onCancel }: SubsidizedCommitmentProps) {
	const [goodFaithChecked, setGoodFaithChecked] = useState(false);
	const [payItForwardChecked, setPayItForwardChecked] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const canConfirm = goodFaithChecked && payItForwardChecked;

	const handleConfirm = async () => {
		setIsLoading(true);
		// 3-second delay to deter automated scripts
		await new Promise((resolve) => setTimeout(resolve, 3000));
		await onConfirm();
		setIsLoading(false);
	};

	return (
		<Modal
			isOpen={isOpen}
			placement="center"
			size="lg"
			onOpenChange={(open) => {
				if (!open && !isLoading) {
					onCancel();
				}
			}}
		>
			<ModalContent>
				<ModalHeader className="flex flex-col gap-1">Community Solidarity Commitment</ModalHeader>
				<ModalBody>
					<p className="text-gray-600 dark:text-gray-300 mb-4">
						This slot is made possible by the contributions of job seekers who came before you. To keep this
						sustainable and prevent abuse, we ask for your commitment to the community.
					</p>

					<div className="space-y-4">
						<div className="flex items-start gap-3">
							<input
								checked={goodFaithChecked}
								className="w-5 h-5 mt-0.5 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
								disabled={isLoading}
								id="good-faith"
								type="checkbox"
								onChange={(e) => setGoodFaithChecked(e.target.checked)}
							/>
							<label className="text-sm text-gray-700 dark:text-gray-300" htmlFor="good-faith">
								<span className="font-medium">Good Faith Use:</span> I confirm I am using this service
								in good faith as an active job seeker.
							</label>
						</div>

						<div className="flex items-start gap-3">
							<input
								checked={payItForwardChecked}
								className="w-5 h-5 mt-0.5 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
								disabled={isLoading}
								id="pay-it-forward"
								type="checkbox"
								onChange={(e) => setPayItForwardChecked(e.target.checked)}
							/>
							<label className="text-sm text-gray-700 dark:text-gray-300" htmlFor="pay-it-forward">
								<span className="font-medium">Pay It Forward:</span> I commit to contributing back to
								the community when I am able.
							</label>
						</div>
					</div>
				</ModalBody>
				<ModalFooter>
					<Button color="default" isDisabled={isLoading} variant="light" onPress={onCancel}>
						Cancel
					</Button>
					<Button
						color="primary"
						isDisabled={!canConfirm || isLoading}
						isLoading={isLoading}
						onPress={handleConfirm}
					>
						{isLoading ? "Setting up your account..." : "Confirm"}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
