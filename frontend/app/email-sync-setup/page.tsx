"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { addToast } from "@heroui/toast";

import { Navbar } from "@/components/navbar";
import GoogleEmailSyncButton from "@/components/GoogleEmailSyncButton";
import Spinner from "@/components/spinner";
import { checkAuth } from "@/utils/auth";

function EmailSyncSetupContent() {
	const router = useRouter();
	const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const init = async () => {
			// Check if user is authenticated
			const isAuthenticated = await checkAuth(apiUrl);
			if (!isAuthenticated) {
				addToast({
					title: "Please log in to continue",
					color: "warning"
				});
				router.push("/login");
				return;
			}

			// Check onboarding and email sync status
			try {
				const response = await fetch(`${apiUrl}/api/users/onboarding-status`, {
					credentials: "include"
				});

				if (response.ok) {
					const data = await response.json();

					// If not onboarded yet, redirect to onboarding
					if (!data.has_completed_onboarding) {
						router.push("/onboarding");
						return;
					}

					// If email sync already configured, redirect to dashboard
					if (data.has_email_sync_configured) {
						router.push("/dashboard");
						return;
					}
				}
			} catch (error) {
				console.error("Error checking status:", error);
			}

			setIsLoading(false);
		};

		init();
	}, [apiUrl, router]);

	if (isLoading) {
		return (
			<div className="flex flex-col min-h-screen">
				<Navbar />
				<main className="flex-grow flex items-center justify-center">
					<Spinner />
				</main>
			</div>
		);
	}

	return (
		<div className="flex flex-col min-h-screen">
			<Navbar />
			<main className="flex-grow flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
				<Card className="max-w-lg w-full">
					<CardHeader className="flex flex-col gap-1 items-center py-8">
						<h1 className="text-2xl font-bold">Connect Your Email</h1>
						<p className="text-sm text-gray-500 mt-2 text-center">
							One last step! Connect a Gmail account to start syncing your job application emails.
						</p>
					</CardHeader>
					<CardBody className="pb-8 space-y-6">
						<div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-lg p-4">
							<h3 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
								How it works:
							</h3>
							<ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
								<li className="flex items-start gap-2">
									<span className="text-emerald-600">1.</span>
									<span>Connect your Gmail account where you receive job application emails</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-emerald-600">2.</span>
									<span>We'll securely scan for job-related emails and extract key information</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-emerald-600">3.</span>
									<span>View all your applications in one organized dashboard</span>
								</li>
							</ul>
						</div>

						<div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-4">
							<p className="text-sm text-amber-800 dark:text-amber-200">
								<strong>Privacy note:</strong> You can connect a different Gmail account than the one
								you signed up with. We only read job-related emails and never store full email content.
							</p>
						</div>

						<GoogleEmailSyncButton />

						<div className="text-center">
							<button
								className="text-sm text-gray-500 hover:text-gray-700 underline"
								onClick={() => router.push("/dashboard")}
							>
								Skip for now (you can set this up later)
							</button>
						</div>
					</CardBody>
				</Card>
			</main>
		</div>
	);
}

export default function EmailSyncSetupPage() {
	return (
		<Suspense
			fallback={
				<div className="flex flex-col min-h-screen">
					<Navbar />
					<main className="flex-grow flex items-center justify-center">
						<Spinner />
					</main>
				</div>
			}
		>
			<EmailSyncSetupContent />
		</Suspense>
	);
}
