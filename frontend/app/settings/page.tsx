"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, Switch, Spinner, Button } from "@heroui/react";
import NextLink from "next/link";

import { Navbar } from "@/components/navbar";
import { checkAuth } from "@/utils/auth";

interface AlwaysOpenSettings {
	always_open_enabled: boolean;
	sync_tier: string;
	premium_reason: string | null;
	last_background_sync_at: string | null;
	has_valid_credentials: boolean;
}

export default function SettingsPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [settings, setSettings] = useState<AlwaysOpenSettings | null>(null);
	const [error, setError] = useState<string | null>(null);
	const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

	useEffect(() => {
		const fetchSettings = async () => {
			try {
				const isAuthenticated = await checkAuth(apiUrl);
				if (!isAuthenticated) {
					router.push("/login");
					return;
				}

				const response = await fetch(`${apiUrl}/settings/always-open`, {
					method: "GET",
					credentials: "include"
				});

				if (response.ok) {
					const data = await response.json();
					setSettings(data);
				} else if (response.status === 401) {
					router.push("/login");
				} else {
					setError("Failed to load settings");
				}
			} catch (err) {
				console.error("Error fetching settings:", err);
				setError("Failed to load settings");
			} finally {
				setLoading(false);
			}
		};

		fetchSettings();
	}, [apiUrl, router]);

	const handleToggle = async (enabled: boolean) => {
		if (!settings?.has_valid_credentials) return;

		setSaving(true);
		try {
			const response = await fetch(`${apiUrl}/settings/always-open`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ enabled })
			});

			if (response.ok) {
				setSettings((prev) => (prev ? { ...prev, always_open_enabled: enabled } : null));
			} else {
				const data = await response.json();
				setError(data.detail || "Failed to update setting");
			}
		} catch (err) {
			console.error("Error updating setting:", err);
			setError("Failed to update setting");
		} finally {
			setSaving(false);
		}
	};

	const formatLastSync = (isoString: string | null): string => {
		if (!isoString) return "Never";
		const date = new Date(isoString);
		return date.toLocaleString();
	};

	const getPremiumReasonText = (reason: string | null): string => {
		switch (reason) {
			case "coach":
				return "You have premium access through your career coach";
			case "contributor":
				return "You have premium access as a $5+/month supporter";
			default:
				return "";
		}
	};

	if (loading) {
		return (
			<div className="flex flex-col min-h-screen">
				<Navbar />
				<main className="flex-grow flex items-center justify-center">
					<Spinner size="lg" />
				</main>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col min-h-screen">
				<Navbar />
				<main className="flex-grow flex items-center justify-center">
					<p className="text-danger">{error}</p>
				</main>
			</div>
		);
	}

	const isPremium = settings?.sync_tier === "premium";

	return (
		<div className="flex flex-col min-h-screen">
			<Navbar />
			<main className="flex-grow bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
				<div className="container mx-auto px-4 py-12 max-w-2xl">
					<h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Settings</h1>

					{/* Automatic Sync Card */}
					<Card className="mb-6">
						<CardHeader className="flex flex-col items-start gap-1 pb-0">
							<h2 className="text-xl font-semibold">Automatic Email Sync</h2>
							<p className="text-sm text-default-500">
								Keep your job applications up to date automatically
							</p>
						</CardHeader>
						<CardBody className="pt-4">
							{/* Current tier status */}
							<div className="mb-6 p-4 rounded-lg bg-default-100">
								<div className="flex items-center justify-between mb-2">
									<span className="font-medium">Your plan</span>
									<span
										className={`px-2 py-1 rounded text-sm font-medium ${
											isPremium
												? "bg-success/20 text-success-600 dark:text-success-400"
												: "bg-default-200 text-default-600"
										}`}
									>
										{isPremium ? "Premium" : "Free"}
									</span>
								</div>
								{isPremium && settings?.premium_reason && (
									<p className="text-sm text-success-600 dark:text-success-400">
										{getPremiumReasonText(settings.premium_reason)}
									</p>
								)}
								{!isPremium && (
									<p className="text-sm text-default-500">
										<NextLink className="text-primary underline" href="/pricing">
											Upgrade to Premium
										</NextLink>{" "}
										for automatic sync every 12 hours
									</p>
								)}
							</div>

							{/* Toggle */}
							<div className="flex items-center justify-between py-4 border-t border-divider">
								<div>
									<p className="font-medium">Background sync</p>
									<p className="text-sm text-default-500">
										{isPremium
											? "Sync your emails automatically every 12 hours"
											: "Available with Premium plan"}
									</p>
								</div>
								{isPremium ? (
									<Switch
										isDisabled={!settings?.has_valid_credentials || saving}
										isSelected={!!settings?.always_open_enabled || false}
										onValueChange={handleToggle}
									/>
								) : (
									<Button
										as={NextLink}
										color="primary"
										href="/pricing"
										size="sm"
									>
										Upgrade
									</Button>
								)}
							</div>

							{/* Credential warning */}
							{isPremium && !settings?.has_valid_credentials && (
								<div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
									<p className="text-sm text-warning-600 dark:text-warning-400">
										Your Google connection needs to be refreshed.{" "}
										<NextLink className="underline" href="/dashboard">
											Go to Dashboard
										</NextLink>{" "}
										and click Refresh to reconnect.
									</p>
								</div>
							)}

							{/* Last sync info */}
							{settings?.always_open_enabled && settings?.last_background_sync_at && (
								<div className="mt-4 pt-4 border-t border-divider">
									<p className="text-sm text-default-500">
										Last background sync: {formatLastSync(settings.last_background_sync_at)}
									</p>
								</div>
							)}

							{/* Manual sync note */}
							<div className="mt-4 pt-4 border-t border-divider">
								<p className="text-sm text-default-500">
									You can always sync manually from the{" "}
									<NextLink className="text-primary underline" href="/dashboard">
										Dashboard
									</NextLink>
									.
								</p>
							</div>
						</CardBody>
					</Card>
				</div>
			</main>
		</div>
	);
}
