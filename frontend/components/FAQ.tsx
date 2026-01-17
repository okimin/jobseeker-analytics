// frontend/components/FAQ.tsx
"use client";

import { Accordion, AccordionItem } from "@heroui/react";
import { LockClosedIcon, ShieldCheckIcon, CodeBracketSquareIcon } from "@heroicons/react/24/solid";

import { EmailIcon } from "./icons";

import { title, subtitle } from "@/components/primitives";

export const FAQ = () => {
	return (
		<section className="flex flex-col items-center justify-center gap-4 py-12 md:py-20 max-w-4xl mx-auto px-6">
			<div className="text-center mb-8">
				<h2 className={title({ size: "sm" })}>💭 Frequently Asked Questions</h2>
				<p className={subtitle({ className: "mt-4 text-primary" })}>
					We believe transparency is a security feature. Here is how we handle your data.
				</p>
			</div>

			<Accordion className="w-full" selectionMode="multiple" variant="splitted">
				{/* Security Section */}
				<AccordionItem
					key="1"
					aria-label="Privacy"
					startContent={<LockClosedIcon className="text-primary h-5 w-5" />}
					subtitle="Hint: No."
					title="Are you going to read all my emails?"
				>
					<div className="flex flex-col gap-3 pb-4">
						<p>
							<strong>Q: I use my personal email. Are you going to read everything?</strong>
						</p>
						<p>
							A: No. JustAJobApp is designed to be as minimal as possible. We don’t "crawl" your entire
							inbox; instead, we use a specific search query to identify only potential job-related
							threads before the application even looks at the content.
						</p>

						<p>
							<strong>Q: So what emails do you actually access?</strong>
						</p>
						<p>
							A: We use a pre-defined filter list (found in our <code>applied_email_filter.yaml</code>)
							that looks for specific "include" terms—like "application received"—and specific sender
							domains like <em>greenhouse.io</em>. If an email doesn't match, it is ignored entirely.
						</p>
					</div>
				</AccordionItem>

				<AccordionItem
					key="2"
					aria-label="Email Data Storage"
					startContent={<EmailIcon className="text-success h-5 w-5" />}
					title="What data from my email do you store on your servers?"
				>
					<div className="flex flex-col gap-3 pb-4 text-default-600">
						<p>We only store the metadata necessary to build your dashboard. This includes:</p>
						<p>
							<strong>Sender</strong> (e.g. 'Rando Recruiter' recruiter@company.com)
						</p>
						<p>
							<strong>Application Status</strong> (e.g., "Rejection," "Interview").
						</p>
						<p>
							<strong>Timestamp</strong> of the interaction.
						</p>
						<p>
							<strong>Company Name</strong>
						</p>
						<p>
							<strong>Job Title</strong>
						</p>
						<p>
							Note: If our AI-powered intelligence determines an email is a "False Positive" (not actually
							related to a job application), we don't store any details about it at all.
						</p>
					</div>
				</AccordionItem>

				<AccordionItem
					key="3"
					aria-label="AI Usage"
					startContent={<ShieldCheckIcon className="text-success h-5 w-5" />}
					title="Eww, AI! Are you training models with my data?"
				>
					<div className="flex flex-col gap-3 pb-4 text-default-200">
						<p>
							<strong>Absolutely not.</strong> We use the Google Gemini API via paid developer services.
							Google’s data privacy terms for paid API users explicitly state that data sent through the
							API is <strong>not used to train their base models</strong>.
						</p>
						<p>
							Your email snippets are used solely to generate your personal dashboard analytics and are
							never shared for model improvement.
						</p>
					</div>
				</AccordionItem>

				{/* Technical/Open Source Section */}
				<AccordionItem
					key="4"
					aria-label="Open Source"
					startContent={<CodeBracketSquareIcon className="text-default-500 h-5 w-5" />}
					title="Open Source vs. Web App"
				>
					<div className="flex flex-col gap-3 pb-4">
						<p>
							<strong>Q: Why is this open source?</strong>
						</p>
						<p>
							A: Transparency. Because we handle sensitive data, we believe our code should be open for
							public audit. Having "more eyeballs" ensures higher security standards.
						</p>
						<p>
							<strong>Q: Do I have to use the web app?</strong>
						</p>
						<p>
							A: No. If you are technical, you can follow our "DIY Install" path on GitHub. Host it on
							your own AWS Lightsail instance and use your own API keys. It’s the exact same codebase.
						</p>
						<a
							className="text-sm text-primary hover:underline"
							href="https://github.com/JustAJobApp/jobseeker-analytics"
							rel="noopener noreferrer"
							target="_blank"
						>
							View Source Code
						</a>
					</div>
				</AccordionItem>
			</Accordion>
		</section>
	);
};
