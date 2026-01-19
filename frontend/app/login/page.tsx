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

	useEffect(() => {
		// On load, check for existing session
		checkAuth(apiUrl).then((authenticated) => {
			if (authenticated) {
				router.push("/dashboard");
			}
		});
	}, [apiUrl, router]);

	return (
		<div className="flex flex-col min-h-screen">
			<Navbar />
			<main className="flex-grow flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
				<Card className="max-w-md w-full">
					<CardHeader className="flex flex-col gap-1 items-center py-8">
						<h1 className="text-2xl font-bold">{isSignup ? "Get Started Free" : "Welcome Back"}</h1>
						<p className="text-sm text-gray-500 text-center">
							{isSignup ? (
								<>
									Connect your Gmail and we&apos;ll automatically find your job applications.
									<br />
									<span className="text-emerald-600 font-medium">Free to start. Pay what you can.</span>
								</>
							) : (
								"Sign in to access your job application dashboard."
							)}
						</p>
					</CardHeader>
					<CardBody className="pb-8">
						{isSignup ? <GoogleSignupButton /> : <GoogleLoginButton />}

						<Divider className="my-6" />

						<p className="text-xs text-gray-500 text-center">
							{isSignup ? (
								<>
									Already have an account?{" "}
									<a className="text-emerald-600 hover:underline" href="/login">
										Sign in
									</a>
								</>
							) : (
								<>
									New to JustAJobApp?{" "}
									<a className="text-emerald-600 hover:underline" href="/login?signup=true">
										Create an account
									</a>
								</>
							)}
						</p>

						<p className="text-xs text-gray-400 text-center mt-4">
							Need help?{" "}
							<a
								className="text-emerald-600 hover:underline"
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
