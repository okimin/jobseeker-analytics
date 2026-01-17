import { useState } from "react";
import { Button, Card, Input } from "@heroui/react";
import { addToast } from "@heroui/toast";

import { CodeIcon, EmailIcon, ExternalLinkIcon, CalendarIcon } from "@/components/icons";

const DeveloperInfo = () => {
	const [email, setEmail] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSetupRequest = async () => {
		if (!email || !email.includes("@")) {
			addToast({
				title: "Please enter your email first",
				color: "danger"
			});
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await fetch("/api/subscribe", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					email,
					formType: "setup"
				})
			});

			const data = await response.json();

			if (data.success) {
				addToast({
					title: "Setup session requested!",
					description: "Check your email for next steps.",
					color: "success"
				});
				setEmail("");
			} else {
				addToast({
					title: "Something went wrong",
					description: data.message || "Please try again later.",
					color: "danger"
				});
			}
		} catch (error) {
			addToast({
				title: "Connection error",
				description: "Please check your network and try again.",
				color: "danger"
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Card
			className="p-6 md:p-8 bg-content1 dark:bg-content2 border-2 border-content3 dark:border-content3"
			id="developerInfoCard"
		>
			<div className="space-y-4">
				<div className="flex items-center gap-2 text-primary-700 dark:text-primary font-semibold">
					<span className="bg-primary-100 dark:bg-content3 text-primary-700 dark:text-primary p-1 rounded-full">
						<CodeIcon size={16} />
					</span>
					Option 2: Run Locally
				</div>

				<h3 className="text-2xl font-bold text-foreground">Use the app right away on your computer</h3>
				<p className="text-foreground/90">
					Don't want to wait? You can install the application directly on your personal computer by following
					these steps:
				</p>

				{/* Removed the background div that was causing issues */}
				<div className="space-y-6 pt-2">
					<div className="space-y-3 border-l-4 border-primary pl-4 bg-primary-50/30 dark:bg-content3/50 p-4 rounded-r-lg">
						<h4 className="font-semibold text-foreground">1. For beginners</h4>
						<p className="text-sm text-foreground/90">
							If you're not familiar with git, let us guide you through the installation process. Request
							a setup session and our team will help you get started.
						</p>
						<div>
							<Input
								fullWidth
								className="mb-2"
								id="request-setup-session-email-input"
								placeholder="Your email address"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
							<Button
								className="mt-2 w-full"
								color="primary"
								id="request-setup-session-button"
								isDisabled={isSubmitting}
								startContent={<CalendarIcon size={16} />}
								onPress={handleSetupRequest}
							>
								{isSubmitting ? "Requesting..." : "Book Setup Session"}
							</Button>
						</div>
					</div>

					<div className="space-y-3 border-l-4 border-content4 dark:border-content4 pl-4 bg-content2/50 dark:bg-content3/30 p-4 rounded-r-lg">
						<h4 className="font-semibold text-foreground">2. For experienced developers</h4>
						<p className="text-sm text-foreground/90">
							If you're familiar with git, the CONTRIBUTING.md file in our repository contains setup
							instructions.
						</p>
						<Button
							startContent={<CodeIcon size={16} />}
							variant="bordered"
							onPress={() =>
								window.open(
									"https://github.com/lnovitz/jobseeker-analytics/blob/main/CONTRIBUTING.md",
									"_blank"
								)
							}
						>
							View on GitHub
						</Button>
					</div>
				</div>

				<div className="border-t border-divider pt-4 mt-6">
					<h4 className="font-semibold mb-2 text-foreground">Support & Feedback</h4>
					<div className="space-y-2">
						<a
							aria-label="Join our Discord server"
							className="flex items-center gap-2 text-sm text-primary hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
							href="https://discord.gg/gsdpMchCam"
							rel="noopener noreferrer"
							target="_blank"
						>
							<ExternalLinkIcon size={16} />
							Join our Discord
						</a>
						<a
							aria-label="Email help@justajobapp.com for support"
							className="flex items-center gap-2 text-sm text-primary hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
							href="mailto:help@justajobapp.com"
						>
							<EmailIcon size={16} />
							Email help@justajobapp.com
						</a>
					</div>
				</div>
			</div>
		</Card>
	);
};

export default DeveloperInfo;
