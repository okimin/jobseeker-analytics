// frontend/app/login/page.tsx

"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";

import { Navbar } from "@/components/navbar";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import GoogleSignupButton from "@/components/GoogleSignupButton";
import { checkAuth } from "@/utils/auth";
import Spinner from "@/components/spinner";

function LoginContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

	// Check if this is a new user signup (from signup=true param)
	const isSignup = searchParams.get("signup") === "true";
	// Check if this is a reconnect flow (session expired, user wants to reconnect Gmail)
	const isReconnect = searchParams.get("reconnect") === "true";

	useEffect(() => {
		// On load, check for existing session (but skip redirect if reconnecting)
		if (!isReconnect) {
			checkAuth(apiUrl).then((authenticated) => {
				if (authenticated) {
					router.push("/dashboard");
				}
			});
		}
	}, [apiUrl, router, isReconnect]);

	return (
		<div className="flex flex-col min-h-screen">
			<Navbar />
			<main
				aria-label="Login page"
				className="flex-grow flex items-center justify-center bg-background p-4 sm:p-6 md:p-8"
				role="main"
			>
				<Card aria-label="Login form" className="max-w-md w-full shadow-lg" role="region">
					<CardHeader className="flex flex-col gap-2 items-center pt-8 pb-4 px-6">
						<h1 className="text-3xl font-bold text-foreground">
							{isReconnect ? "Reconnect to Gmail" : isSignup ? "Get Started Free" : "Welcome Back"}
						</h1>
						<p className="text-sm text-default-500 text-center">
							{isReconnect ? (
								<>
									Your session has expired. Sign in again to scan for new applications.
									<br />
									<span className="text-primary font-medium">
										Your existing data is still available.
									</span>
								</>
							) : isSignup ? (
								<>
									Connect your Gmail and we&apos;ll automatically find your job applications.
									<br />
									<span className="text-primary font-medium">
										Free to start. Pay what you can.
									</span>
								</>
							) : (
								"Sign in to access your job application dashboard."
							)}
						</p>
					</CardHeader>
					<CardBody className="pb-8 px-6">
						{isReconnect ? (
							<GoogleLoginButton />
						) : isSignup ? (
							<GoogleSignupButton />
						) : (
							<GoogleLoginButton />
						)}

						<Divider className="my-6" />

						<p className="text-xs text-default-500 text-center">
							{isReconnect ? (
								<>
									Changed your mind?{" "}
									<a className="text-primary hover:underline" href="/dashboard">
										Back to dashboard
									</a>
								</>
							) : isSignup ? (
								<>
									Already have an account?{" "}
									<a className="text-primary hover:underline" href="/login">
										Sign in
									</a>
								</>
							) : (
								<>
									New to JustAJobApp?{" "}
									<a className="text-primary hover:underline" href="/login?signup=true">
										Create an account
									</a>
								</>
							)}
						</p>

						<p className="text-xs text-default-400 text-center mt-4">
							Need help?{" "}
							<a
								className="text-primary hover:underline"
								href="mailto:help@justajobapp.com"
								target="_blank"
							>
								help@justajobapp.com
							</a>
						</p>
					</CardBody>
				</Card>
			</main>
		</div>
	);
}

export default function LoginPage() {
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
			<LoginContent />
		</Suspense>
	);
}
