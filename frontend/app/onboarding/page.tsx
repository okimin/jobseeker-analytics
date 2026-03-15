"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import posthog from "posthog-js";

import { GoogleIcon } from "@/components/icons";
import { Navbar } from "@/components/navbar";
import Spinner from "@/components/spinner";
import { checkAuth } from "@/utils/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "jobseeker" | "coach";
type Screen =
	| "loading"
	| "step1"
	| "step2"
	| "step3"
	| "step4-scanning"
	| "step4a-i"
	| "step4a-ii"
	| "step4b-i"
	| "step4b-ii"
	| "empty-state";

const PRESETS = [
	{ value: "1_week", label: "Last week", days: 7 },
	{ value: "1_month", label: "Last month", days: 30 },
	{ value: "3_months", label: "3 months", days: 90 },
	{ value: "6_months", label: "6 months", days: 180 }
];

function formatDate(d: Date) {
	return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function daysAgoDate(days: number) {
	const d = new Date();
	d.setDate(d.getDate() - days);
	return d;
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step, total = 3 }: { step: number; total?: number }) {
	return (
		<div className="w-full mb-6">
			<div className="flex justify-between text-xs text-gray-400 mb-1">
				<span>
					Step {step} of {total}
				</span>
			</div>
			<div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
				<div
					className="h-1.5 bg-blue-500 rounded-full transition-all"
					style={{ width: `${(step / total) * 100}%` }}
				/>
			</div>
		</div>
	);
}

// ─── Main content ─────────────────────────────────────────────────────────────

function OnboardingContent() {
	const router = useRouter();
	const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

	// Core state
	const [screen, setScreen] = useState<Screen>("loading");
	const [role, setRole] = useState<Role | null>(null);
	const [plan, setPlan] = useState<string>("free");
	const [userEmail, setUserEmail] = useState<string>("");
	const [syncEmail, setSyncEmail] = useState<string | null>(null);
	const [gmailError, setGmailError] = useState<string | null>(null);

	// Step 3 state
	const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
	const [customDate, setCustomDate] = useState("");
	const [coachEndDate, setCoachEndDate] = useState("");
	const [promoCode, setPromoCode] = useState("");
	const [promoError, setPromoError] = useState<string | null>(null);
	const [dateError, setDateError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [savedStartDate, setSavedStartDate] = useState<Date | null>(null);
	const [savedEndDate, setSavedEndDate] = useState<string>("");

	// Step 4 state
	const [applicationsFound, setApplicationsFound] = useState(0);
	const [scanElapsed, setScanElapsed] = useState(0);
	const [scanFailed, setScanFailed] = useState(false);
	const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);

	// ── Effective start date (computed from preset or custom) ─────────────────
	const effectiveStartDate: Date | null = (() => {
		if (selectedPreset) {
			const preset = PRESETS.find((p) => p.value === selectedPreset);
			if (preset) return daysAgoDate(preset.days);
		}
		if (customDate) return new Date(customDate + "T00:00:00");
		return null;
	})();

	const isOldDate = effectiveStartDate ? effectiveStartDate < daysAgoDate(30) : false;

	// ── Polling for scan status ───────────────────────────────────────────────
	const stopPolling = useCallback(() => {
		if (pollRef.current) clearInterval(pollRef.current);
		if (elapsedRef.current) clearInterval(elapsedRef.current);
	}, []);

	const startPolling = useCallback(
		(startDateForCheck: Date | null, currentRole: Role, currentPlan: string) => {
			setScanElapsed(0);
			setScanFailed(false);

			elapsedRef.current = setInterval(() => {
				setScanElapsed((s) => s + 1);
			}, 1000);

			pollRef.current = setInterval(async () => {
				try {
					const res = await fetch(`${apiUrl}/processing/status`, {
						credentials: "include"
					});
					if (!res.ok) return;
					const data = await res.json();
					const found = data.applications_found ?? 0;
					setApplicationsFound(found);

					if (data.status === "complete") {
						stopPolling();
						if (found === 0) {
							setScreen("empty-state");
						} else if (currentRole === "jobseeker") {
							const withinWindow = startDateForCheck === null || startDateForCheck >= daysAgoDate(30);
							setScreen(withinWindow ? "step4a-i" : "step4a-ii");
						} else {
							setScreen(currentPlan === "promo" ? "step4b-i" : "step4b-ii");
						}
					}
				} catch {
					// network error — keep polling
				}
			}, 3000);
		},
		[apiUrl, stopPolling]
	);

	useEffect(() => () => stopPolling(), [stopPolling]);

	// ── Initialisation ───────────────────────────────────────────────────────
	useEffect(() => {
		const init = async () => {
			const isAuthenticated = await checkAuth(apiUrl);
			if (!isAuthenticated) {
				router.push("/login");
				return;
			}

			// Fetch login email and identify in PostHog
			try {
				const meRes = await fetch(`${apiUrl}/me`, { credentials: "include" });
				if (meRes.ok) {
					const me = await meRes.json();
					setUserEmail(me.email ?? me.user_email ?? "");
					if (me.user_id) posthog.identify(me.user_id, { email: me.email });
				}
			} catch {
				// non-blocking
			}

			// Check if returning from Gmail OAuth flow
			const gmailConnecting = localStorage.getItem("gmailConnecting");
			if (gmailConnecting) localStorage.removeItem("gmailConnecting");

			// Fetch onboarding status + processing status in parallel
			const [statusRes, processingRes] = await Promise.all([
				fetch(`${apiUrl}/api/users/onboarding-status`, { credentials: "include" }),
				fetch(`${apiUrl}/processing/status`, { credentials: "include" })
			]);

			if (!statusRes.ok) {
				router.push("/login");
				return;
			}

			const status = await statusRes.json();
			const processing = processingRes.ok ? await processingRes.json() : null;

			if (status.has_completed_onboarding) {
				router.replace("/dashboard");
				return;
			}

			const currentRole: Role = status.role && status.role !== "jobseeker" ? status.role : status.role || null;
			setRole(currentRole as Role | null);
			setPlan(status.plan ?? "free");
			setSyncEmail(status.sync_email_address ?? null);

			if (!status.role) {
				setScreen("step1");
				posthog.capture("onboarding_started");
				return;
			}

			if (!status.has_email_sync_configured) {
				// Show denial message if they just returned from a failed OAuth
				if (gmailConnecting) {
					setGmailError(
						"Gmail access is required to use JustAJobApp. We only read — never modify — your inbox."
					);
				}
				setScreen("step2");
				return;
			}

			// Gmail is connected — check if a scan is in progress or just finished
			if (processing && processing.status === "processing") {
				setScreen("step4-scanning");
				startPolling(null, currentRole as Role, status.plan ?? "free");
				return;
			}

			setScreen("step3");
		};

		init();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// ── Handlers ─────────────────────────────────────────────────────────────

	const handleRoleSelect = async (selectedRole: Role) => {
		setRole(selectedRole);
		try {
			await fetch(`${apiUrl}/api/onboarding/role`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ role: selectedRole })
			});
		} catch {
			// non-blocking; role will be re-fetched on next page load
		}
		posthog.capture("onboarding_role_selected", { role: selectedRole });
		setScreen("step2");
	};

	const handleConnectGmail = () => {
		localStorage.setItem("gmailConnecting", "1");
		posthog.capture("gmail_connect_started", { role });
		window.location.href = `${apiUrl}/auth/google/email-sync`;
	};

	const handleStep3Submit = async () => {
		// Validate inputs
		if (!effectiveStartDate) {
			setDateError("Please select or enter a start date");
			return;
		}
		if (effectiveStartDate > new Date()) {
			setDateError("Start date can't be in the future");
			return;
		}
		if (role === "coach") {
			if (!coachEndDate) {
				setDateError("Please enter an end date");
				return;
			}
			if (new Date(coachEndDate) <= effectiveStartDate) {
				setDateError("End date must be after start date");
				return;
			}
		}
		setDateError(null);
		setIsSaving(true);
		setSavedStartDate(effectiveStartDate);
		setSavedEndDate(coachEndDate);

		try {
			// For coaches with a promo code: validate + apply promo BEFORE triggering backfill
			let appliedPlan = "free";
			if (role === "coach" && promoCode.trim()) {
				const promoRes = await fetch(`${apiUrl}/api/onboarding/apply-promo`, {
					method: "POST",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ code: promoCode.trim() })
				});
				if (promoRes.ok) {
					const promoData = await promoRes.json();
					if (!promoData.valid) {
						setPromoError("That code isn't valid — check for typos");
						// Don't block submission — proceed as free-tier coach
					} else {
						appliedPlan = "promo";
						setPlan("promo");
						setPromoError(null);
					}
				}
			}

			// Trigger backfill via start-date (plan is now updated if promo was valid)
			// Coaches use oldest_first so the dashboard shows from their chosen start date.
			// Job seekers use recent_first (rolling last-30-day window).
			const fetchOrder = role === "coach" ? "oldest_first" : "recent_first";
			const startDatePayload = selectedPreset
				? { preset: selectedPreset, fetch_order: fetchOrder, end_date: coachEndDate || null }
				: {
						preset: "custom",
						custom_date: effectiveStartDate.toISOString().split("T")[0],
						fetch_order: fetchOrder,
						end_date: coachEndDate || null
					};

			const sdRes = await fetch(`${apiUrl}/settings/start-date`, {
				method: "PUT",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(startDatePayload)
			});

			if (!sdRes.ok) {
				throw new Error("Failed to save start date");
			}

			posthog.capture("onboarding_scan_started", { role, plan: appliedPlan });
			setScreen("step4-scanning");
			startPolling(effectiveStartDate, role!, appliedPlan);
		} catch (err) {
			console.error("Step 3 submit error:", err);
			setDateError("Something went wrong. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	const handleGoToDashboard = async () => {
		try {
			await fetch(`${apiUrl}/api/users/complete-onboarding`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" }
			});
		} catch {
			// non-blocking — onboarding_completed_at may already be set
		}
		posthog.capture("onboarding_completed", { role, plan });
		router.push("/dashboard");
	};

	const handleRetryGmail = () => {
		setGmailError(null);
		handleConnectGmail();
	};

	const handleRetryScan = async () => {
		setScanFailed(false);
		setScanElapsed(0);
		setScreen("step4-scanning");
		// Re-trigger via processing/start
		try {
			await fetch(`${apiUrl}/processing/start`, { method: "POST", credentials: "include" });
		} catch {
			// ignore
		}
		startPolling(savedStartDate, role!, plan);
	};

	const handleUpgrade = async () => {
		try {
			const res = await fetch(`${apiUrl}/payment/checkout`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ amount_cents: 900, trigger_type: "onboarding", is_recurring: true })
			});
			if (res.ok) {
				const data = await res.json();
				window.open(data.checkout_url, "_blank", "noopener,noreferrer");
			}
		} catch {
			// ignore
		}
	};

	// ── Today string for date picker max ─────────────────────────────────────
	const todayStr = new Date().toISOString().split("T")[0];
	const yesterdayStr = (() => {
		const d = new Date();
		d.setDate(d.getDate() - 1);
		return d.toISOString().split("T")[0];
	})();

	// ── Shared card wrapper ──────────────────────────────────────────────────
	const Card = ({ children }: { children: React.ReactNode }) => (
		<div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">{children}</div>
	);

	const pillClass = (active: boolean) =>
		`flex-1 py-2 px-3 rounded-lg border text-sm transition-colors cursor-pointer ${
			active
				? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
				: "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300"
		}`;

	// ── Screens ───────────────────────────────────────────────────────────────

	if (screen === "loading") {
		return (
			<>
				<Navbar />
				<main className="flex-grow flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
					<Spinner />
					<p className="mt-4 text-gray-600 dark:text-gray-300">Setting up your account…</p>
				</main>
			</>
		);
	}

	// Screen 1 — Role selection
	if (screen === "step1") {
		return (
			<>
				<Navbar />
				<main className="flex-grow flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
					<div className="w-full max-w-md">
						<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
							Why are you here?
						</h1>
						<p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-8">
							This helps us set up the right experience for you.
						</p>
						<div className="flex flex-col gap-4">
							<button
								className="w-full p-5 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left transition-all"
								onClick={() => handleRoleSelect("jobseeker")}
							>
								<p className="font-semibold text-gray-900 dark:text-white mb-1">
									I&apos;m actively job searching
								</p>
								<p className="text-sm text-gray-500 dark:text-gray-400">
									Track applications from your own Gmail inbox
								</p>
							</button>
							<button
								className="w-full p-5 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left transition-all"
								onClick={() => handleRoleSelect("coach")}
							>
								<p className="font-semibold text-gray-900 dark:text-white mb-1">
									I&apos;m a career coach / evaluating
								</p>
								<p className="text-sm text-gray-500 dark:text-gray-400">
									Demo the app with data from a past job search
								</p>
							</button>
						</div>
					</div>
				</main>
			</>
		);
	}

	// Screen 2 — Gmail consent (2A: job seeker / 2B: coach)
	if (screen === "step2") {
		const isCoach = role === "coach";
		return (
			<>
				<Navbar />
				<main className="flex-grow flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
					<Card>
						<ProgressBar step={1} />
						<h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
							{isCoach ? "Connect the Gmail from your past job search" : "Now let's connect your inbox"}
						</h1>
						<p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
							{isCoach
								? "Connect the specific Gmail account that has the job search emails you want to use."
								: "This is separate from signing in. We need permission to read the Gmail account where you receive job emails."}
						</p>

						{userEmail && (
							<p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
								You signed in with:{" "}
								<span className="font-medium text-gray-700 dark:text-gray-300">{userEmail}</span>
							</p>
						)}

						<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4 text-sm text-blue-800 dark:text-blue-200">
							{isCoach
								? "This can be a different Google account than the one you signed in with. If your old job search emails are in a different inbox, you can connect that one instead."
								: "Make sure to select the Gmail you use for job applications — this may be different from the account you signed in with."}
						</div>

						<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
							<span>🔒</span>
							<span>Read your emails</span>
						</div>

						{gmailError && (
							<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4 text-sm text-red-700 dark:text-red-300">
								{gmailError}
							</div>
						)}

						<Button
							className="w-full bg-emerald-600 text-white hover:bg-emerald-700 mb-3"
							size="lg"
							startContent={<GoogleIcon size={18} />}
							onPress={gmailError ? handleRetryGmail : handleConnectGmail}
						>
							Connect Gmail
						</Button>

						{syncEmail && (
							<div className="mt-2 text-sm text-center">
								<span className="text-green-600 dark:text-green-400 font-medium">
									✓ Connected: {syncEmail}
								</span>
								<button className="ml-2 text-blue-500 underline text-xs" onClick={handleConnectGmail}>
									Not the right account? Connect a different one
								</button>
							</div>
						)}

						<p className="text-xs text-gray-400 text-center mt-3">
							We can never send, delete, or modify your emails.
						</p>
					</Card>
				</main>
			</>
		);
	}

	// Screen 3A (job seeker) / 3B (coach)
	if (screen === "step3") {
		const isCoach = role === "coach";
		return (
			<>
				<Navbar />
				<main className="flex-grow flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
					<Card>
						<ProgressBar step={2} />
						<h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
							{isCoach
								? "Pick a date range from your past job search"
								: "When did your job search start?"}
						</h1>
						<p className="text-gray-500 dark:text-gray-400 text-sm mb-5">
							{isCoach
								? "We'll scan this specific window so you can demo the app with your real data."
								: "We'll scan from this date forward. You can change this later in Settings."}
						</p>

						{/* Quick-select pills */}
						<div className="flex gap-2 flex-wrap mb-4">
							{PRESETS.map((preset) => (
								<button
									key={preset.value}
									className={pillClass(selectedPreset === preset.value)}
									onClick={() => {
										setSelectedPreset(preset.value);
										setCustomDate("");
									}}
								>
									{preset.label}
								</button>
							))}
						</div>

						{/* Custom start date */}
						<div className="mb-4">
							<label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
								{isCoach ? "Or pick a specific start date" : "Or pick a specific date"}
							</label>
							<input
								className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
								max={isCoach ? yesterdayStr : todayStr}
								type="date"
								value={customDate}
								onChange={(e) => {
									setCustomDate(e.target.value);
									setSelectedPreset(null);
								}}
							/>
						</div>

						{/* Preview text */}
						{effectiveStartDate && (
							<p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
								{isCoach ? "Start: " : "We'll scan from "}
								<span className="font-medium text-gray-700 dark:text-gray-300">
									{formatDate(effectiveStartDate)}
								</span>
							</p>
						)}

						{/* Coach: end date */}
						{isCoach && (
							<div className="mb-4">
								<label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
									End date <span className="text-red-400">*</span>
								</label>
								<input
									className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
									max={todayStr}
									min={
										effectiveStartDate ? effectiveStartDate.toISOString().split("T")[0] : undefined
									}
									type="date"
									value={coachEndDate}
									onChange={(e) => setCoachEndDate(e.target.value)}
								/>
								{effectiveStartDate && coachEndDate && (
									<p className="text-xs text-gray-400 mt-1">
										{(() => {
											const months = Math.round(
												(new Date(coachEndDate).getTime() - effectiveStartDate.getTime()) /
													(1000 * 60 * 60 * 24 * 30)
											);
											return `That's ~${months} month${months !== 1 ? "s" : ""} of emails`;
										})()}
									</p>
								)}
							</div>
						)}

						{/* Free user info for old start dates (job seeker) */}
						{!isCoach && isOldDate && (
							<div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4 text-sm text-amber-800 dark:text-amber-200">
								Your dashboard shows the most recent 30 days. Your full history is always available via
								CSV export — the 30-day limit only applies to what&apos;s visible in the dashboard.
							</div>
						)}

						{/* Coach: promo code */}
						{isCoach && (
							<>
								<hr className="border-gray-200 dark:border-gray-700 my-4" />
								<div className="mb-4">
									<label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
										Have a promo code? <span className="text-gray-400">(optional)</span>
									</label>
									<input
										className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white uppercase"
										maxLength={20}
										placeholder="COACH2026"
										type="text"
										value={promoCode}
										onChange={(e) => {
											setPromoCode(e.target.value.toUpperCase());
											setPromoError(null);
										}}
									/>
									{promoError && <p className="text-xs text-red-500 mt-1">{promoError}</p>}
								</div>
							</>
						)}

						{dateError && <p className="text-sm text-red-500 mb-3">{dateError}</p>}

						<Button
							className="w-full"
							color="primary"
							isLoading={isSaving}
							size="lg"
							onPress={handleStep3Submit}
						>
							Scan my inbox →
						</Button>
					</Card>
				</main>
			</>
		);
	}

	// Screen 4 — Scanning
	if (screen === "step4-scanning") {
		return (
			<>
				<Navbar />
				<main className="flex-grow flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
					<Card>
						<ProgressBar step={3} />
						<div className="text-center">
							<Spinner />
							<h1 className="text-xl font-bold text-gray-900 dark:text-white mt-4 mb-2">
								Scanning your inbox
							</h1>
							<p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
								{scanElapsed > 60
									? "Still scanning — larger inboxes can take a couple of minutes"
									: "We're finding your job-related emails. This usually takes under 60 seconds."}
							</p>
							{savedStartDate && (
								<p className="text-sm text-gray-400 mb-4">
									Scanning from {formatDate(savedStartDate)} to today
								</p>
							)}
							{applicationsFound > 0 && (
								<p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
									Found {applicationsFound} job-related email
									{applicationsFound !== 1 ? "s" : ""} so far…
								</p>
							)}
							{scanFailed && (
								<div className="mt-4 space-y-2">
									<p className="text-sm text-red-500">Something went wrong scanning your inbox.</p>
									<Button color="primary" size="sm" onPress={handleRetryScan}>
										Try again
									</Button>
									<Button
										className="ml-2"
										color="default"
										size="sm"
										variant="light"
										onPress={handleGoToDashboard}
									>
										Skip for now
									</Button>
								</div>
							)}
						</div>
					</Card>
				</main>
			</>
		);
	}

	// Screen 4A-i — Job seeker, within 30 days
	if (screen === "step4a-i") {
		return (
			<>
				<Navbar />
				<main className="flex-grow flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
					<Card>
						<ProgressBar step={3} />
						<div className="text-center">
							<div className="text-4xl mb-3">✓</div>
							<h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
								You&apos;re all set
							</h1>
							<p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
								We found{" "}
								<span className="font-semibold text-gray-700 dark:text-gray-300">
									{applicationsFound} job-related email
									{applicationsFound !== 1 ? "s" : ""}
								</span>
							</p>
							<p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
								Your entire search fits within your free window — nothing will be hidden.
							</p>
							<Button className="w-full" color="primary" size="lg" onPress={handleGoToDashboard}>
								Go to my dashboard →
							</Button>
						</div>
					</Card>
				</main>
			</>
		);
	}

	// Screen 4A-ii — Job seeker, beyond 30 days
	if (screen === "step4a-ii") {
		return (
			<>
				<Navbar />
				<main className="flex-grow flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
					<Card>
						<ProgressBar step={3} />
						<div className="text-center">
							<div className="text-4xl mb-3">✓</div>
							<h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
								You&apos;re all set
							</h1>
							<p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
								We found{" "}
								<span className="font-semibold text-gray-700 dark:text-gray-300">
									{applicationsFound} job-related email
									{applicationsFound !== 1 ? "s" : ""}
								</span>
							</p>
							<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-5 text-sm text-blue-800 dark:text-blue-200 text-left">
								Free accounts show the most recent 30 days in the dashboard. As your search continues,
								your view stays current — older entries roll out as new ones come in. Your full history
								is always exportable via CSV.
							</div>
							<Button className="w-full mb-3" color="primary" size="lg" onPress={handleGoToDashboard}>
								Go to my dashboard →
							</Button>
							<Button
								className="w-full mb-3"
								color="secondary"
								size="lg"
								variant="flat"
								onPress={handleUpgrade}
							>
								Upgrade to Premium — $9/mo
							</Button>
							<p className="text-xs text-gray-400">
								You can{" "}
								<button className="underline text-blue-500" onClick={handleGoToDashboard}>
									export all your data to CSV
								</button>{" "}
								at any time, for free.
							</p>
						</div>
					</Card>
				</main>
			</>
		);
	}

	// Screen 4B-i — Coach, valid promo
	if (screen === "step4b-i") {
		return (
			<>
				<Navbar />
				<main className="flex-grow flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
					<Card>
						<ProgressBar step={3} />
						<div className="text-center">
							<div className="text-4xl mb-3">✓</div>
							<h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
								You&apos;re all set
							</h1>
							<p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
								We found{" "}
								<span className="font-semibold text-gray-700 dark:text-gray-300">
									{applicationsFound} job-related email
									{applicationsFound !== 1 ? "s" : ""}
								</span>
								{savedStartDate && savedEndDate && (
									<>
										{" "}
										from{" "}
										<span className="font-medium">
											{formatDate(savedStartDate)} – {formatDate(new Date(savedEndDate))}
										</span>
									</>
								)}
							</p>
							<p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
								You have full access to your selected date range — nothing is hidden.
							</p>
							<Button className="w-full" color="primary" size="lg" onPress={handleGoToDashboard}>
								Go to my dashboard →
							</Button>
						</div>
					</Card>
				</main>
			</>
		);
	}

	// Screen 4B-ii — Coach, no promo
	if (screen === "step4b-ii") {
		return (
			<>
				<Navbar />
				<main className="flex-grow flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
					<Card>
						<ProgressBar step={3} />
						<div className="text-center">
							<div className="text-4xl mb-3">⚠️</div>
							<h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
								You&apos;re all set — with a limitation
							</h1>
							<p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
								We found{" "}
								<span className="font-semibold text-gray-700 dark:text-gray-300">
									{applicationsFound} job-related email
									{applicationsFound !== 1 ? "s" : ""}
								</span>{" "}
								from the first 30 days of your selected range.
							</p>
							<div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-5 text-sm text-amber-800 dark:text-amber-200 text-left">
								Without a promo code, you can see up to 30 days from your start date. To access your
								full selected range, enter a coach promo code.
							</div>
							<Button className="w-full mb-3" color="primary" size="lg" onPress={handleGoToDashboard}>
								Go to my dashboard →
							</Button>
							<Button
								className="w-full mb-3"
								color="default"
								size="lg"
								variant="flat"
								onPress={() =>
									window.open(
										"mailto:help@justajobapp.com?subject=Coach promo code request",
										"_blank"
									)
								}
							>
								Get a promo code
							</Button>
							<p className="text-xs text-gray-400">
								You can export all your data to CSV at any time, for free.
							</p>
						</div>
					</Card>
				</main>
			</>
		);
	}

	// Empty state — no emails found
	if (screen === "empty-state") {
		return (
			<>
				<Navbar />
				<main className="flex-grow flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
					<Card>
						<ProgressBar step={3} />
						<div className="text-center">
							<div className="text-4xl mb-3">📭</div>
							<h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
								We didn&apos;t find any job-related emails
							</h1>
							<ul className="text-sm text-gray-500 dark:text-gray-400 text-left space-y-2 mb-6 mt-4">
								<li>
									• Is this the right Gmail account? You connected{" "}
									<span className="font-medium text-gray-700 dark:text-gray-300">
										{syncEmail ?? "your Gmail"}
									</span>
									.
								</li>
								<li>• Try a wider date range — you can change this in Settings.</li>
								<li>
									• Your emails may use formats we don&apos;t recognise yet — you can add them
									manually from the dashboard.
								</li>
							</ul>
							<Button
								className="w-full mb-3"
								color="primary"
								size="lg"
								variant="flat"
								onPress={handleConnectGmail}
							>
								Connect a different Gmail account
							</Button>
							<Button
								className="w-full"
								color="default"
								size="lg"
								variant="light"
								onPress={handleGoToDashboard}
							>
								Go to dashboard anyway
							</Button>
						</div>
					</Card>
				</main>
			</>
		);
	}

	return null;
}

// ─── Page wrapper ──────────────────────────────────────────────────────────────

export default function OnboardingPage() {
	return (
		<div className="flex flex-col min-h-screen">
			<Suspense
				fallback={
					<>
						<Navbar />
						<main className="flex-grow flex items-center justify-center">
							<Spinner />
						</main>
					</>
				}
			>
				<OnboardingContent />
			</Suspense>
		</div>
	);
}
