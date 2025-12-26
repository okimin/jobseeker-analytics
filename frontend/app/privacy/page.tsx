import React from "react";

const PrivacyPolicyPage = () => {
	return (
		<main className="container mx-auto px-4 py-8 text-gray-800 dark:text-gray-200">
			<h1 className="text-3xl font-bold mb-4">Privacy Notice</h1>
			<p className="text-sm mb-8 italic">Effective Date: December 25, 2025</p>

			{/* GUIDING PRINCIPLES */}
			<section className="mb-8">
				<p>
					This Privacy Notice for <strong>JustAJobApp LLC</strong> (doing business as{" "}
					<strong>JustAJobApp</strong>) establishes the protocols for the collection, storage, and processing
					of personal information when using our services, including the web application hosted at{" "}
					<a className="text-blue-600 underline" href="https://justajobapp.com">
						justajobapp.com
					</a>
					. Our operations prioritize transparency and data minimization. We do not request personal
					information unless required for core service functionality, i.e. <strong>increasing job search productivity</strong>.
				</p>
			</section>

			{/* 1. CALIFORNIA NOTICE AT COLLECTION */}
			<h2 className="text-2xl font-semibold mb-4 mt-8 border-b pb-2">
				1. Notice at Collection: Categories of Information
			</h2>
			<div className="overflow-x-auto">
				<table className="min-w-full border border-gray-300 mb-4 text-sm">
					<thead className="bg-gray-100 dark:bg-gray-800">
						<tr>
							<th className="border p-2 text-left">Category</th>
							<th className="border p-2 text-left">Business Purpose</th>
							<th className="border p-2 text-left">Retention Period</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td className="border p-2 font-semibold">Identifiers (Name, Email, IP)</td>
							<td className="border p-2">
								Account authentication, security monitoring, and session management.
							</td>
							<td className="border p-2">Duration of active account.</td>
						</tr>
						<tr>
							<td className="border p-2 font-semibold">Sensitive Data (Gmail Metadata)</td>
							<td className="border p-2">Automated job tracking and status extraction.</td>
							<td className="border p-2">Duration of active account.</td>
						</tr>
						<tr>
							<td className="border p-2 font-semibold">Commercial Data (Transactions)</td>
							<td className="border p-2">Subscription processing via Stripe.</td>
							<td className="border p-2">7 Years (IRS record-keeping).</td>
						</tr>
					</tbody>
				</table>
			</div>

			{/* 2. THIRD-PARTY DISCLOSURES */}
			<h2 className="text-2xl font-semibold mb-4 mt-8">2. Third-Party Service Providers</h2>
			<p className="mb-4 text-sm">
				We utilize specific third-party vendors to maintain our infrastructure. These parties are contractually
				prohibited from processing your data for any purpose other than those instructed by JustAJobApp LLC:
			</p>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
				<div className="p-3 border rounded bg-gray-50 dark:bg-gray-900">
					<p className="font-bold">Core Infrastructure</p>
					<ul className="list-disc list-inside">
						<li>
							<strong>Cloud:</strong> AWS, Google Cloud Platform
						</li>
						<li>
							<strong>Payments:</strong> Stripe
						</li>
						<li>
							<strong>Auth:</strong> Google OAuth 2.0
						</li>
						<li>
							<strong>Analytics:</strong> PostHog
						</li>
					</ul>
				</div>
				<div className="p-3 border rounded bg-gray-50 dark:bg-gray-900">
					<p className="font-bold">Communication & AI</p>
					<ul className="list-disc list-inside">
						<li>
							<strong>Messaging:</strong> Systeme.io, ConvertKit, MailerLite
						</li>
						<li>
							<strong>AI Processing:</strong> Google Cloud AI, Google Gemini API
						</li>
						<li>
							<strong>Compliance:</strong> Termly.io
						</li>
					</ul>
				</div>
			</div>

			{/* 3. EMAIL SYNCHRONIZATION & REFRESH TOKENS */}
			<h2 className="text-2xl font-semibold mb-4 mt-8">3. Specialized Data Processing: Gmail Synchronization</h2>
			<p className="mt-2 text-sm">
				JustAJobApp serves as a specialized data processor using the <strong>Google OAuth2 framework</strong> 
				and the <strong>Gmail API</strong>. We utilize the following technical protocols:
			</p>
			<ul className="list-disc list-inside space-y-2 mt-2 ml-4 text-sm">
				<li>
					<strong>Refresh Token Authentication:</strong> The App utilizes secure, encrypted refresh tokens
					rather than account passwords to maintain connectivity.
				</li>
				<li>
					<strong>Background Synchronization:</strong> These tokens allow the App to periodically check for
					updates or new submissions in the background without requiring active user login.
				</li>
				<li>
					<strong>Incremental Synchronization:</strong> We only request messages received after the timestamp
					of your last successfully processed email.
				</li>
			</ul>

			{/* 4. FILTERING & ANALYSIS */}
			<h2 className="text-2xl font-semibold mb-4 mt-8">4. Targeted Data Filtering</h2>
			<p className="mt-2 text-sm">The Gmail API is filtered through three distinct layers to ensure privacy:</p>
			<ul className="list-disc list-inside space-y-3 mt-3 ml-4 text-sm">
				<li>
					<strong>Initial Discovery:</strong> Potential job-related messages are identified based on keywords
					defined in our{" "}
					<a
						className="text-blue-600 underline"
						href="https://github.com/JustAJobApp/jobseeker-analytics/blob/main/backend/email_query_filters/applied_email_filter.yaml"
					>
						applied_email_filter.yaml
					</a>
					.
				</li>
				<li>
					<strong>Intelligent Analysis:</strong> An analysis layer defined in our{" "}
					<a
						className="text-blue-600 underline"
						href="https://github.com/JustAJobApp/jobseeker-analytics/blob/main/backend/utils/llm_utils.py"
					>
						llm_utils.py 
					</a>
					evaluates messages to discard newsletters and personal data unrelated to your job search.
				</li>
				<li>
					<strong>Domain-Based Optimization:</strong> As applications are verified, future fetches may rely on
					stored email domains from verified job-related emails to maintain tracking reliability.
				</li>
			</ul>

			{/* 5. UNITED STATES DATA PROCESSING (RESTORED) */}
			<h2 className="text-2xl font-semibold mb-4 mt-8">5. International Users: United States Processing</h2>
			<p className="text-sm">
				JustAJobApp LLC is based in the United States and the Websites are hosted in the United States. If you
				are accessing the Websites from the European Union, Asia, or any other region with laws governing data
				collection and use that differ from U.S. law, please note that you are transferring your personal data
				to the United States.
			</p>
			<p className="mt-2 text-sm">By providing your personal data, you consent to:</p>
			<ul className="list-disc list-inside space-y-2 mt-2 ml-4 text-sm font-medium">
				<li>The use of your personal data for the specific job-tracking purposes identified above.</li>
				<li>The transfer and processing of your personal data in the United States.</li>
			</ul>

			{/* 6. GOOGLE LIMITED USE COMPLIANCE */}
			<h2 className="text-2xl font-semibold mb-4 mt-8">6. Google API Limited Use Requirements</h2>
			<p className="text-sm">
				JustAJobApp adheres to the{" "}
				<a
					className="text-blue-600 underline ml-1"
					href="https://developers.google.com/terms/api-services-user-data-policy"
				>
					Google API Services User Data Policy
				</a>
				.
			</p>
			<ul className="list-disc list-inside space-y-2 mt-2 font-medium text-sm">
				<li>NO Human Access to your data unless explicitly authorized by you for support.</li>
				<li>NO Data Transfer to third parties for targeted advertising.</li>
				<li>NO Use for AI Training: We do not use Google Workspace data to train generalized AI/ML models.</li>
			</ul>

			{/* 7. CALIFORNIA STATUTORY RIGHTS */}
			<h2 className="text-2xl font-semibold mb-4 mt-8 border-t pt-4">7. Your California Privacy Rights (CPRA)</h2>
			<ul className="list-disc list-inside space-y-2 ml-4 text-sm">
				<li>
					<strong>Right to Know:</strong> Disclosure of what data points are collected.
				</li>
				<li>
					<strong>Right to Delete:</strong> Request data purge, subject to IRS guidance.
				</li>
				<li>
					<strong>Right to Correct:</strong> Rectify inaccurate personal information.
				</li>
				<li>
					<strong>Right to Opt-Out:</strong> JustAJobApp does not sell or share data for behavioral
					advertising.
				</li>
				<li>
					<strong>Right to Limit Use:</strong> We restrict mailbox data usage to core service functions.
				</li>
				<li>
					<strong>Do-Not-Track:</strong> As required by CalOPPA, we do not currently respond to browser DNT
					signals.
				</li>
			</ul>

			{/* 8. ADMINISTRATIVE ACCESS & CONTACT */}
			<h2 className="text-2xl font-semibold mb-4 mt-8 border-t pt-4">8. Administrative Access</h2>
			<p className="mb-6 text-sm">
				Engineers may locate individual emails related to a Job Application only in response to a bug report,
				authorized support request, or security investigation. All production data access must be specifically
				authorized by JustAJobApp LLC.
			</p>
			<h2 className="text-2xl font-semibold mb-2 mt-6">9. Changes and Updates to this Privacy Policy</h2>
			<p>
				We may occasionally update this Privacy Policy. When we do, we will also revise the Effective Date at
				the top of this page. We encourage you to periodically review this Privacy Policy to stay informed about
				how we are protecting the personal information we collect. Your continued use of the Websites
				constitutes your agreement to this Privacy Policy and any updates.
			</p>
			<h2 className="text-2xl font-semibold mb-2 mt-6">10. Contact Information</h2>
			<div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
				<p className="font-bold">JustAJobApp LLC</p>
				<p>2108 N St, STE N</p>
				<p>Sacramento, CA 95816</p>
				<p>United States</p>
				<p className="mt-2 font-semibold">
					Privacy Officer:{" "}
					<a className="text-blue-600 underline" href="mailto:privacy@justajobapp.com">
						privacy@justajobapp.com
					</a>
				</p>
			</div>
		</main>
	);
};

export default PrivacyPolicyPage;
