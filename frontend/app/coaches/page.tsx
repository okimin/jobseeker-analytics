"use client";

import { Navbar } from "@/components/navbar";

const CoachesPage = () => {
	return (
		<div className="flex flex-col min-h-screen">
			<main className="flex-grow bg-gradient-to-b from-background to-background/95">
				<Navbar />
				<div className="container mx-auto px-4 py-16 sm:py-24 max-w-5xl text-center">
					<h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r pb-6 from-emerald-600 to-green-600">
						For Career Coaches
					</h1>
					<p className="mt-6 text-xl leading-8 text-gray-600 dark:text-gray-300">
						Keep in the loop of upcoming interviews without hurting your thumbs.
					</p>
					<p className="mt-4 text-xl leading-8 text-gray-600 dark:text-gray-300">
						Get real-time access to your clients' job search activity, such as:
					</p>
					<ul className="list-disc list-inside text-xl leading-8 text-gray-600 dark:text-gray-300">
						<li>Upcoming interviews</li>
						<li>Referrals</li>
						<li>Recruiter inbounds via InMail</li>
						<li>And even job offers</li>
					</ul>
				</div>
				<section className="bg-white dark:bg-gray-900 py-4">
					<div className="container mx-auto px-4 max-w-3xl">
						<div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-gradient-to-b from-emerald-50/70 to-white dark:from-emerald-950/20 dark:to-gray-900 p-8 shadow-lg">
							<h3 className="text-2xl font-semibold mb-4 text-emerald-800 dark:text-emerald-200">
								Career Coaches & Clients
							</h3>
							<p className="text-gray-700 dark:text-gray-200 mb-6 text-lg">
								Sign up at Coach.JustAJobApp.com
							</p>
							<a
								className="inline-flex w-full items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 transition-colors duration-200"
								href="https://coach.justajobapp.com/?utm_source=homepage&utm_campaign=coaches_2"
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
