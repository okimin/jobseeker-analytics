"use client";

import { useState } from "react";
import { Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";

interface ManageSubscriptionModalProps {
	isOpen: boolean;
	onClose: () => void;
	currentAmountCents: number;
	onUpdate: (newAmountCents: number) => Promise<void>;
	onCancel: () => Promise<void>;
}

export default function ManageSubscriptionModal({
	isOpen,
	onClose,
	currentAmountCents,
	onUpdate,
	onCancel
}: ManageSubscriptionModalProps) {
	const [newAmount, setNewAmount] = useState((currentAmountCents / 100).toString());
	const [isUpdating, setIsUpdating] = useState(false);
	const [isCancelling, setIsCancelling] = useState(false);
	const [showCancelConfirm, setShowCancelConfirm] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [hasEdited, setHasEdited] = useState(false);

	const currentDollarAmount = currentAmountCents / 100;

	const isValidAmount = () => {
		const parsed = parseFloat(newAmount);
		return !isNaN(parsed) && parsed >= 1;
	};

	const getNewAmountCents = () => {
		const parsed = parseFloat(newAmount);
		if (isNaN(parsed) || parsed < 1) return currentAmountCents;
		return Math.round(parsed * 100);
	};

	const hasChanges = getNewAmountCents() !== currentAmountCents;

	const handleUpdate = async () => {
		if (!isValidAmount() || !hasChanges) return;

		setIsUpdating(true);
		setError(null);

		try {
			await onUpdate(getNewAmountCents());
			onClose();
		} catch (err) {
			setError("Failed to update subscription. Please try again.");
		} finally {
			setIsUpdating(false);
		}
	};

	const handleCancel = async () => {
		setIsCancelling(true);
		setError(null);

		try {
			await onCancel();
			onClose();
		} catch (err) {
			setError("Failed to cancel subscription. Please try again.");
		} finally {
			setIsCancelling(false);
			setShowCancelConfirm(false);
		}
	};

	const handleClose = () => {
		if (isUpdating || isCancelling) return;
		setShowCancelConfirm(false);
		setError(null);
		setHasEdited(false);
		setNewAmount((currentAmountCents / 100).toString());
		onClose();
	};

	return (
		<Modal isOpen={isOpen} onClose={handleClose}>
			<ModalContent>
				<ModalHeader className="flex flex-col gap-1">Manage Subscription</ModalHeader>
				<ModalBody>
					{showCancelConfirm ? (
						<div className="space-y-4">
							<p className="text-foreground/80">
								Are you sure you want to cancel your subscription? Your support helps keep this tool free for
								others.
							</p>
							{error && <p className="text-danger text-sm">{error}</p>}
						</div>
					) : (
						<div className="space-y-4">
							<p className="text-foreground/70 text-sm">
								You&apos;re currently contributing ${currentDollarAmount}/month. Thank you for your support!
							</p>

							<div>
								<label className="block text-sm font-medium text-foreground/80 mb-1">Monthly amount</label>
								<div className="flex items-center gap-2">
									<span className="text-default-500">$</span>
									<Input
										className="max-w-24"
										color="default"
										disabled={isUpdating || isCancelling}
										min={1}
										placeholder="5"
										size="sm"
										type="number"
										value={newAmount}
										variant="bordered"
										onChange={(e) => {
									setNewAmount(e.target.value);
									setHasEdited(true);
								}}
									/>
									<span className="text-default-500">/month</span>
								</div>
								{!isValidAmount() && hasEdited && (
									<p className="text-xs text-danger mt-1">Please enter an amount of at least $1</p>
								)}
							</div>

							{error && <p className="text-danger text-sm">{error}</p>}
						</div>
					)}
				</ModalBody>
				<ModalFooter>
					{showCancelConfirm ? (
						<>
							<Button color="default" isDisabled={isCancelling} variant="light" onPress={() => setShowCancelConfirm(false)}>
								Keep Subscription
							</Button>
							<Button color="danger" isLoading={isCancelling} onPress={handleCancel}>
								Yes, Cancel
							</Button>
						</>
					) : (
						<>
							<Button
								color="danger"
								isDisabled={isUpdating}
								variant="light"
								onPress={() => setShowCancelConfirm(true)}
							>
								Cancel Subscription
							</Button>
							<Button
								color="primary"
								isDisabled={!isValidAmount() || !hasChanges}
								isLoading={isUpdating}
								onPress={handleUpdate}
							>
								Update
							</Button>
						</>
					)}
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
