"use client";

import { useState } from "react";

import { Navbar } from "@/components/navbar";
import Footer from "@/components/Footer";

const Index = () => {
	const [showImagePopup, setShowImagePopup] = useState(false);
	const [popupImageSrc, setPopupImageSrc] = useState("");

	return (
		<div className="flex flex-col min-h-screen overflow-x-hidden">
			<main className="flex-grow bg-gradient-to-b from-background to-background/95">
				<Navbar />
				<div className="w-full bg-gradient-to-b from-amber-50/60 to-transparent dark:from-gray-800/30 border-b border-amber-100/40 dark:border-emerald-900/30">
					<div className="container mx-auto px-4 py-16 sm:py-24 max-w-5xl">
						{/* Content continues */}
						<div className="text-center">
							<h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r pb-6 from-amber-600 to-emerald-600">
								Get the System Behind a 3x Interview Rate.
							</h1>
							<p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
								JustAJobApp.com connects to your inbox to <em>automatically</em> build your job search
								dashboard. No more spreadsheets. No more manual data entry.
							</p>
							<div className="mt-10 flex items-center justify-center gap-x-6">
								<a
									className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
									href="https://www.buymeacoffee.com/justajobapp"
									rel="noopener noreferrer"
									target="_blank"
								>
									<span className="mr-2">☕</span>
									Buy us a coffee
								</a>
							</div>
							<p className="mt-4 text-sm text-gray-500">Support our project to help us launch faster.</p>
						</div>
					</div>
				</div>
			</main>

			{/* (Removed Social Proof Bar per spec) */}

			{/* Problem/Agitation Section */}
			<div className="bg-gray-50 dark:bg-gray-900/40 py-24">
				<div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
					<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
						The "Second Job" of Job Searching is Burning You Out.
					</h2>
					<p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
						The market is brutal. Applications per hire have <em>tripled</em> since 2021, and 90% of
						candidates are rejected or ghosted.
					</p>
					<p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
						No wonder 64% of job seekers report symptoms of burnout—feeling exhausted, stuck, and
						overwhelmed.
					</p>
					<p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
						You're already managing a full-time job. The last thing you have time for is:
					</p>
					<ul className="mt-4 list-disc list-inside space-y-2 text-lg leading-8 text-gray-600 dark:text-gray-300">
						<li>Manually copying and pasting job descriptions into a spreadsheet.</li>
						<li>
							Sifting through your inbox to find out <em>who</em> you heard back from.
						</li>
						<li>Worrying you're missing critical recruiter emails in your spam folder.</li>
						<li>Losing track of applications, deadlines, and follow-ups.</li>
					</ul>
					<p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
						Your problem isn't your qualifications; it's the inefficient, time-consuming <em>process</em>.
					</p>
				</div>
			</div>

			{/* Solution / Value Prop Section */}
			<div className="bg-white dark:bg-gray-900 py-24">
				<div className="mx-auto max-w-7xl px-6 lg:px-8">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
						<div>
							<h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-900 dark:text-white">
								Go from Inbox Chaos to Automated Clarity.
							</h2>
							<p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
								JustAJobApp.com connects securely to your email inbox.
							</p>
							<p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
								The moment you apply, it automatically parses your application confirmations,
								rejections, and interview invitations. It builds a living, breathing dashboard of your
								entire job search.
							</p>
							<p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
								You see the company, job title, application status, and contact date—all without lifting
								a finger. Finally, you can focus on your current role while your job search runs
								efficiently (and discreetly) in the background.
							</p>
						</div>
						<div>
							{/* Placeholder for dashboard GIF */}
							<div
								className="bg-gray-200 dark:bg-gray-700 h-96 w-full rounded-lg flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
								onClick={() => {
									setPopupImageSrc("homepage/Solution-Screenshot.png");
									setShowImagePopup(true);
								}}
							>
								<div className="relative">
									<img
										alt="Clean, modern dashboard showing automated application tracking"
										className="max-h-80 max-w-full object-contain"
										src="homepage/Solution-Screenshot.png"
									/>
									<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity">
										<svg
											className="h-12 w-12 text-white"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m4-3H6"
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
											/>
										</svg>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Differentiator Section */}
			<div className="py-24">
				<div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
					<h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-900 dark:text-white">
						Stop "Clipping." Start Automating.
					</h2>
					<p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
						Unlike other job trackers (Huntr, Teal, Simplify) that force you to <em>manually "clip"</em>{" "}
						every job with a browser extension, JustAJobApp.com is automated.
					</p>
					<p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
						Apply for a job. Get a confirmation email. That's it. Your tracker is now up to date. It’s an{" "}
						<strong>email-powered</strong> tracker designed for busy professionals who value efficiency and
						discretion.
					</p>
					<p className="mt-6 text-base text-gray-700 dark:text-gray-400">
						<strong>
							Our open-source project ("jobseeker-analytics") has a 48% star-to-download conversion rate
						</strong>{" "}
						— <em>3 times higher than the median</em> for other job search tools.
					</p>
				</div>
			</div>

			{/* Social Proof / Testimonials Section */}
			<div className="bg-white dark:bg-gray-900 py-24">
				<div className="mx-auto max-w-4xl px-6 lg:px-8">
					<div className="text-center mb-10">
						<h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-900 dark:text-white">
							Why 100+ Beta Testers Ditched Their Spreadsheets
						</h2>
					</div>
					<div className="space-y-10">
						<div className="bg-gradient-to-r from-amber-50 to-emerald-50 dark:from-amber-950/30 dark:to-emerald-950/30 rounded-xl p-8 border border-amber-200 dark:border-amber-800/50">
							<div className="flex items-start gap-4">
								<div className="flex-shrink-0">
									<svg className="w-8 h-8 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
										<path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
									</svg>
								</div>
								<div className="flex-1">
									<blockquote className="text-lg italic text-gray-700 dark:text-gray-300 leading-relaxed">
										"I receive so many emails a day that I mistook one for a rejection. Later, I saw
										a color-coded 'Hiring Freeze' status in JustAJobApp that caught my eye. It
										prompted me to go back and find the email—it wasn't a rejection, but an
										invitation to apply for a reopened position.{" "}
										<strong>
											I would have completely missed this opportunity if it wasn't for
											JustAJobApp.
										</strong>
										"
									</blockquote>
									<div className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
										Computer Science & Engineering New Grad (May 2025), F1-OPT
									</div>
								</div>
							</div>
						</div>
						<div className="bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-950/30 dark:to-amber-950/30 rounded-xl p-8 border border-emerald-200 dark:border-emerald-800/50">
							<div className="flex items-start gap-4">
								<div className="flex-shrink-0">
									<svg className="w-8 h-8 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
										<path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
									</svg>
								</div>
								<div className="flex-1">
									<blockquote className="text-lg italic text-gray-700 dark:text-gray-300 leading-relaxed">
										"I get to see the entire picture on a single dashboard... and{" "}
										<strong>not have to continually update a spreadsheet.</strong>"
									</blockquote>
									<div className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
										Donal Murphy, MBA, Global Events Producer
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Founder's Story / Credibility Section */}
			<div className="py-24">
				<div className="mx-auto max-w-7xl px-6 lg:px-8">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-12 items-center">
						<div className="md:col-span-2">
							{/* Founder Image with click functionality */}
							<div
								className="bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
								onClick={() => {
									setPopupImageSrc("homepage/News.png");
									setShowImagePopup(true);
								}}
							>
								<div className="relative">
									<img
										alt="Founder of Just A Job App"
										className="max-h-80 max-w-full object-contain"
										src="homepage/News.png"
									/>
									<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity">
										<svg
											className="h-8 w-8 text-white"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m4-3H6"
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
											/>
										</svg>
									</div>
								</div>
							</div>
						</div>
						<div className="py-24 md:col-span-2">
							<h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-900 dark:text-white">
								Built From Frustration. Proven by Results.
							</h2>
							<p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
								In 2024, after my role supporting clients like Netflix and Riot Games was eliminated by
								email, I was thrown into the job market chaos. I submitted 118 tailored applications and
								my inbox flooded with 70 rejections.
							</p>
							<p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
								Out of frustration, I built a system. <strong>It worked.</strong>
							</p>
							<p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
								I turned those <strong>118 cold applications</strong> into{" "}
								<strong>21 recruiter calls</strong>, achieving a <strong>17% interview rate</strong>
								—triple the industry average. My LinkedIn profile attracted 10 recruiters, propelling me
								to <strong>4 final rounds</strong> and <strong>2 offers</strong>.
							</p>
							<p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
								But even with this success, I was so overwhelmed I forgot to update my spreadsheet and
								even <em>missed an interview</em>. The manual tracking was unsustainable.
							</p>
							<p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
								I turned my system into an email-powered tool and shared it on GitHub. Over 25
								developers and 100+ beta testers helped build what JustAJobApp.com is today. We've
								tracked over 3,000 applications and 268 interview invites. I built this so you can get
								the results without the burnout.
							</p>
							<p className="mt-4 font-semibold text-gray-900 dark:text-white">
								– Lianna Novitz, Founder of Just A Job App
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Future Vision / Coming Soon Section */}
			<div className="bg-gray-50 dark:bg-gray-900/60 py-24">
				<div className="mx-auto max-w-7xl px-6 lg:px-8">
					<div className="mx-auto max-w-2xl lg:text-center">
						<h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-900 dark:text-white">
							The Future: From Automated Tracking to Effortless Prep
						</h2>
						<p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
							Tracking your applications is just the beginning. The next, most stressful step is preparing
							for the interview.
						</p>
						<p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
							At my peak, I was managing 9 interviews in a single week. It was madness.
						</p>
						<p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
							<strong>Coming Soon:</strong> Once JustAJobApp.com detects an interview in your inbox, it
							will automatically spring into action. We're building a system to help you prepare by
							identifying interviewers from the calendar invite, drafting company-specific questions, and
							mapping key talking points from your resume to the job description.
						</p>
						<p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
							Support our project today to help us launch the automated tracker and be the first to know
							when interview prep is launched.
						</p>
					</div>
				</div>
			</div>

			{/* (Removed FAQ per spec) */}

			{/* Final Call to Action Section */}

			<section className="w-full px-4 py-16" id="waitlist">
				<div className="max-w-4xl mx-auto">
					<div className="bg-gradient-to-r from-amber-50 to-emerald-50 dark:from-amber-950/30 dark:to-emerald-950/30 rounded-xl p-6 sm:p-8 border border-amber-200 dark:border-amber-800/50 text-center transition-all">
						<h2 className="text-2xl sm:text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-emerald-600 dark:from-amber-500 dark:to-emerald-400">
							Stop Dreading Your Job Search.
						</h2>
						<p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
							Take back your time. End the spreadsheet madness. Automate your job search and focus on what{" "}
							<em>actually</em> matters: landing the offer.
						</p>

						<div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
							<h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
								Help Us Launch Faster 🚀
							</h3>
							<p className="text-gray-600 dark:text-gray-300 mb-6">
								JustAJobApp.com is currently blocked by Google's 100-user hard cap. To lift this cap and
								make the app available to everyone, we must pass a one-time,{" "}
								<strong>$3,000 mandatory security audit</strong>.
							</p>
							<p className="text-gray-600 dark:text-gray-300 mb-6">
								Your support will directly fund this audit. It is the only thing standing between
								JustAJobApp.com and helping thousands of job seekers.
							</p>
							<div className="flex justify-center">
								<a
									className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200 shadow-lg hover:shadow-xl"
									href="https://www.buymeacoffee.com/justajobapp"
									rel="noopener noreferrer"
									target="_blank"
								>
									<span className="mr-3 text-xl">☕</span>
									Buy us a coffee
								</a>
							</div>
						</div>
					</div>
				</div>
			</section>

			<Footer />

			{/* Image Popup Overlay */}
			{showImagePopup && (
				<div
					className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
					onClick={() => setShowImagePopup(false)}
				>
					<div className="relative w-full max-w-6xl">
						<button
							className="absolute -top-12 right-0 text-white hover:text-amber-500 focus:outline-none"
							onClick={(e) => {
								e.stopPropagation();
								setShowImagePopup(false);
							}}
						>
							<svg
								className="h-8 w-8"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M6 18L18 6M6 6l12 12"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
								/>
							</svg>
						</button>
						<div className="bg-white flex justify-center dark:bg-gray-800 p-6 rounded-lg shadow-2xl overflow-hidden">
							<img
								alt="Enlarged image"
								className="h-auto"
								src={popupImageSrc}
								style={{ maxHeight: "90vh" }}
								onClick={(e) => e.stopPropagation()}
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Index;
