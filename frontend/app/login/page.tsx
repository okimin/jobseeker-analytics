// frontend/app/login/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input, Button, Card, CardBody, CardHeader } from "@heroui/react";

import { Navbar } from "@/components/navbar";
import Footer from "@/components/Footer";
import { GoogleIcon } from "@/components/icons";
import { checkAuth } from "@/utils/auth";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [isVerified, setIsVerified] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();
	const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

	useEffect(() => {
		// On load, check for existing session
		checkAuth(apiUrl).then((authenticated) => {
			if (authenticated) {
				router.push("/dashboard");
			}
		});
	}, [apiUrl, router]);

	const handleVerifyEmail = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const response = await fetch(`${apiUrl}/verify-beta-email`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email })
			});
			const data = await response.json();

			if (data.is_active) {
				setIsVerified(true); // Reveal Google button if active
			} else if (!data.is_active) {
				setIsVerified(false);
			} else {
				setError("Access not yet granted. Join the waitlist below.");
			}
		} catch (err) {
			setError("Verification failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleLogin = () => {
		window.location.href = `${apiUrl}/auth/google`; // Initiate OAuth
	};

	return (
		<div className="flex flex-col min-h-screen">
			<Navbar />
			<main className="flex-grow flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
				<Card className="max-w-md w-full">
					<CardHeader className="flex flex-col gap-1 items-center py-8">
						<h1 className="text-2xl font-bold">Beta Tester Login</h1>
						<p className="text-sm text-gray-500">Verify your email to continue</p>
					</CardHeader>
					<CardBody className="pb-8">
						{!isVerified ? (
							<form className="space-y-4" onSubmit={handleVerifyEmail}>
								<Input
									required
									label="Beta Email Address"
									placeholder="Enter the email used for beta access"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
								<Button className="w-full bg-emerald-600 text-white" isLoading={loading} type="submit">
									Verify Access
								</Button>
								{error && (
									<div className="text-center space-y-2">
										<p className="text-red-500 text-sm">{error}</p>
										<a
											className="text-emerald-600 hover:underline text-sm block"
											href="https://its.justajobapp.com/"
											target="_blank"
										>
											Join the Waitlist →
										</a>
									</div>
								)}
							</form>
						) : (
							<div className="space-y-4 text-center">
								<p className="text-emerald-600 font-medium">Email verified!</p>
								<Button
									className="w-full bg-white border-gray-300 text-gray-700"
									startContent={<GoogleIcon size={20} />}
									variant="bordered"
									onPress={handleGoogleLogin}
								>
									Login with Google
								</Button>
							</div>
						)}
					</CardBody>
				</Card>
			</main>
			<Footer />
		</div>
	);
}
