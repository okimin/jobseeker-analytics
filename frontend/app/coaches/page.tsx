"use client";

import { Navbar } from "@/components/navbar";
import { siteConfig } from "@/config/site";

const CoachesPage = () => {
	return (
		<div className="flex flex-col min-h-screen">
			<main className="flex-grow">
				<Navbar />
				<div className="container mx-auto px-4 py-16 sm:py-24 max-w-5xl text-center">
					<h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-foreground pb-6">
						For Career Coaches
					</h1>
					<p className="mt-6 text-xl leading-8 text-foreground/90">
						Keep in the loop of upcoming interviews without hurting your thumbs.
					</p>
					<p className="mt-4 text-xl leading-8 text-foreground/90">
						Get real-time access to your clients' job search activity, such as:
					</p>
					<ul className="list-disc list-inside text-xl leading-8 text-foreground/90 mt-4 space-y-2">
						<li>Upcoming interviews</li>
						<li>Referrals</li>
						<li>Recruiter inbounds via InMail</li>
						<li>And even job offers</li>
					</ul>
				</div>
				<section className="py-8">
					<div className="container mx-auto px-4 max-w-3xl">
						<div className="rounded-2xl border-2 border-primary/40 dark:border-primary/30 bg-gradient-to-br from-primary-100/40 to-content1 dark:from-content3 dark:to-content2 p-8 shadow-xl text-center">
							<h3 className="text-2xl font-semibold mb-4 text-primary-700 dark:text-primary">
								Career Coaches & Clients
							</h3>
							<p className="text-foreground/90 mb-6 text-lg">Sign up at Coach.JustAJobApp.com</p>
							<a
								className="inline-flex w-full items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
								href={siteConfig.links.coachPortal}
								rel="noopener noreferrer"
								target="_blank"
							>
								Go to Coach.JustAJobApp.com
							</a>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
};

export default CoachesPage;
