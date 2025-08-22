"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addToast, Progress, Button } from "@heroui/react";

import Spinner from "../../components/spinner";

import { checkAuth } from "@/utils/auth";

const ProcessingPage = () => {
	const router = useRouter();
	const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
	const [progress, setProgress] = useState(0);
	const [isCancelling, setIsCancelling] = useState(false);
	const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
	const [processedEmails, setProcessedEmails] = useState(0);
	const [totalEmails, setTotalEmails] = useState(0);

	useEffect(() => {
		const process = async () => {
			// Check if user is logged in
			const isAuthenticated = await checkAuth(apiUrl);
			if (!isAuthenticated) {
				addToast({
					title: "You need to be logged in to access this page.",
					color: "warning"
				});
				router.push("/");
				return;
			}

			const interval = setInterval(async () => {
				try {
					const res = await fetch(`${apiUrl}/processing`, {
						method: "GET",
						credentials: "include"
					});

					const result = await res.json();
					const total = Number(result.total_emails);
					const processed = Number(result.processed_emails);
					console.log(`Progress update: ${processed}/${total} - ${result.message}`);
					
					setProcessedEmails(processed);
					setTotalEmails(total);
					
					if (!total || isNaN(total)) {
						setProgress(100);
					} else {
						setProgress(100 * (processed / total));
					}
					if (result.message === "Processing complete") {
						clearInterval(interval);
						// Force a full page refresh to ensure new user status is checked
						window.location.href = "/dashboard";
					} else if (result.message === "Processing cancelled") {
						clearInterval(interval);
						addToast({
							title: "Processing was cancelled",
							color: "warning"
						});
						// Force a full page refresh to ensure new user status is checked
						window.location.href = "/dashboard";
					}
				} catch {
					router.push("/logout");
				}
			}, 3000);

			setIntervalId(interval);
			return () => clearInterval(interval);
		};

		process();
	}, [router]);

	const handleCancel = async () => {
		setIsCancelling(true);
		try {
			const response = await fetch(`${apiUrl}/cancel-fetch-emails`, {
				method: "POST",
				credentials: "include"
			});

			if (response.ok) {
				if (intervalId) {
					clearInterval(intervalId);
				}
				addToast({
					title: "Processing cancelled successfully",
					color: "success"
				});
				// Force a full page refresh to ensure new user status is checked
				window.location.href = "/dashboard";
			} else {
				const result = await response.json();
				addToast({
					title: result.detail || "Failed to cancel processing",
					color: "danger"
				});
			}
		} catch (error) {
			addToast({
				title: "Error cancelling processing",
				color: "danger"
			});
		} finally {
			setIsCancelling(false);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center h-full">
			<div className="flex flex-col items-center justify-center">
				<h1 className="text-3xl font-semibold mb-4">We are hard at work!</h1>
				<Spinner />
				<div className="mb-3" />
				<Progress
					aria-label="Processing emails..."
					className="max-w-md"
					showValueLabel={true}
					size="md"
					value={progress}
				/>
				<div className="mb-3" />
				<p className="text-sm text-gray-600 dark:text-gray-400">
					{processedEmails} of {totalEmails} emails processed
				</p>
				<p className="text-lg mt-4">
					Eating rejections for dinner. You will be redirected to your dashboard soon.
				</p>
				<div className="mt-6">
					<Button
						color="danger"
						variant="bordered"
						isLoading={isCancelling}
						onPress={handleCancel}
					>
						{isCancelling ? "Cancelling..." : "Cancel Processing"}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default ProcessingPage;
