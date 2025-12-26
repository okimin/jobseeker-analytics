import React from "react";

const PrivacyPolicyPage = () => {
	return (
		<main className="container mx-auto px-4 py-8 text-gray-800 dark:text-gray-200">
			<h1 className="text-3xl font-bold mb-4">Privacy Notice</h1>
			<p className="text-sm mb-8 italic">Effective Date: December 25, 2025</p>

			<section className="mb-8">
				<p>
					This Privacy Notice for <strong>JustAJobApp LLC</strong> (doing business as{" "}
					<strong>JustAJobApp</strong>) describes the protocols for the collection, storage, and processing of
					personal information when using our services, including the web application hosted at{" "}
					<a className="text-blue-600 underline" href="https://justajobapp.com">
						justajobapp.com
					</a>
					.
				</p>
			</section>

			{/* CALIFORNIA NOTICE AT COLLECTION - MANDATORY FOR CPRA */}
			<h2 className="text-2xl font-semibold mb-4 mt-8 border-b pb-2">
				1. Notice at Collection: Categories of Information
			</h2>
			<p className="mb-4">
				In the preceding 12 months, JustAJobApp LLC has collected the following categories of personal
				information for the business purposes of automated job tracking and interview preparation:
			</p>
			<div className="overflow-x-auto">
				<table className="min-w-full border border-gray-300 mb-4 text-sm">
					<thead className="bg-gray-100 dark:bg-gray-800">
						<tr>
							<th className="border p-2 text-left">Category</th>
							<th className="border p-2 text-left">Specific Examples</th>
							<th className="border p-2 text-left">Retention Period</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td className="border p-2 font-semibold">Identifiers</td>
							<td className="border p-2">
								Legal name, email address, IP address, and account identifiers.
							</td>
							<td className="border p-2">Duration of active account.</td>
						</tr>
						<tr>
							<td className="border p-2 font-semibold">Sensitive Personal Information</td>
							<td className="border p-2">
								Contents of email messages (limited to job-search related metadata).
							</td>
							<td className="border p-2">Duration of active account.</td>
						</tr>
						<tr>
							<td className="border p-2 font-semibold">Commercial Data</td>
							<td className="border p-2">Transaction history via Stripe; payment instrument metadata.</td>
							<td className="border p-2">7 years (per IRS record-keeping guidance).</td>
						</tr>
						<tr>
							<td className="border p-2 font-semibold">Network Activity</td>
							<td className="border p-2">
								Browsing history, search history, and interaction with our web app.
							</td>
							<td className="border p-2">Duration of active account.</td>
						</tr>
					</tbody>
				</table>
			</div>

			<h2 className="text-2xl font-semibold mb-4 mt-8">2. How We Process Your Information</h2>
			<p>
				We process your information to fulfill the core service of <strong>Automated Job Tracking</strong>. This
				includes:
			</p>
			<ul className="list-disc list-inside space-y-2 mt-2">
				<li>
					<strong>Metadata Extraction:</strong> Identifying "Company Name," "Job Title," and "Application
					Status" from your inbox.
				</li>
				<li>
					<strong>Interview Preparation:</strong> Extracting interviewer names and dates from authorized
					invitations.
				</li>
				<li>
					<strong>Security:</strong> Monitoring for fraud and protecting the user community from malicious
					job-related domains.
				</li>
			</ul>

			<h2 className="text-2xl font-semibold mb-4 mt-8">3. Google API & Limited Use Compliance</h2>
			<p>
				JustAJobApp’s use and transfer of information received from Google APIs adheres to the
				<a
					className="text-blue-600 underline ml-1"
					href="https://developers.google.com/terms/api-services-user-data-policy"
				>
					Google API Services User Data Policy
				</a>
				, including the <strong>Limited Use</strong> requirements.
			</p>
			<blockquote className="border-l-4 border-gray-300 pl-4 my-4 italic">
				Data obtained via Google Workspace APIs is strictly prohibited from being used to train generalized AI
				or machine learning models. We do not transfer this data to third parties for targeted advertising.
			</blockquote>

			<h2 className="text-2xl font-semibold mb-4 mt-8">4. Your California Privacy Rights (CPRA)</h2>
			<p>California residents possess the following statutory rights:</p>
			<ul className="list-disc list-inside space-y-2 mt-2">
				<li>
					<strong>Right to Know:</strong> Disclosure of what specific data points we have collected.
				</li>
				<li>
					<strong>Right to Delete:</strong> Request deletion of data, subject to legal/tax exceptions.
				</li>
				<li>
					<strong>Right to Correct:</strong> Correction of inaccurate personal information.
				</li>
				<li>
					<strong>Right to Limit Use:</strong> You may limit the use of Sensitive Personal Information to only
					what is necessary to provide the service.
				</li>
			</ul>
			<p className="mt-4">
				To exercise these rights, please submit a <strong>Data Subject Access Request</strong> to
				<a className="text-blue-600 underline ml-1" href="mailto:privacy@justajobapp.com">
					privacy@justajobapp.com
				</a>
				.
			</p>

			<h2 className="text-2xl font-semibold mb-4 mt-8">5. Do-Not-Track (DNT) Signals</h2>
			<p>
				As required by CalOPPA, we disclose that we do not currently respond to browser Do-Not-Track signals as
				no uniform technology standard for recognizing these signals has been finalized.
			</p>

			<h2 className="text-2xl font-semibold mb-4 mt-8">6. Children’s Privacy</h2>
			<p>
				We do not knowingly collect data from or market to children under <strong>18 years of age</strong>. By
				using the Services, you represent that you are at least 18. If we learn that personal information from a
				minor has been collected, we will deactivate the account and delete the data within 30 days.
			</p>

			<p className="mt-2">
				As used in this policy, “personal information” means information that would allow a party to identify
				you such as, for example, your name, address or location, telephone number or email address.
			</p>
			<p className="mt-2">
				By accessing the Websites or using the JustAJobApp applications, you are accepting and agreeing to the
				practices described in this Privacy Policy.
			</p>
			<h2 className="text-2xl font-semibold mb-2 mt-6">Disclosures of Personal Information</h2>
			<p>
				In general, it is not JustAJobApp’s practice to disclose personal information to third parties. We may
				share personal information in two instances:
			</p>
			<p className="mt-2">
				First, JustAJobApp may share personal information with our contractors and service providers in order to
				maintain, enhance, or add to the functionality of the Websites or third party products that we integrate
				with. A prime example of this is Systeme.io, which is our email service provider for our newsletters and
				mailing lists. It would be impossible for them to send email on our behalf without your email address.
				Another example would be Stripe, which is the service provider we use for processing payments.
			</p>
			<p className="mt-2">
				Second, we may disclose your personal information to third parties in a good faith belief that such
				disclosure is reasonably necessary to (a) take action regarding suspected illegal activities; (b)
				enforce or apply our Master Terms of Use and Privacy Policy; (c) comply with legal process, such as a
				search warrant, subpoena, statute, or court order; or (d) protect our rights, reputation, and property,
				or that of our users, affiliates, or the public.
			</p>
			<p className="mt-2">
				If JustAJobApp is required to provide a third party with your personal information (whether by subpoena
				or otherwise), then provided we have collected and retained an email address for you, JustAJobApp will
				use reasonable means to notify you promptly of that event, unless prohibited by law or JustAJobApp is
				otherwise advised not to notify you on the advice of legal counsel.
			</p>
			<h2 className="text-2xl font-semibold mb-2 mt-6">Disclosure of Anonymized and/or Aggregated Information</h2>
			<p>
				JustAJobApp reserves the right to use and disclose anonymized and/or aggregated information, whether
				public or private so long as it has not been combined with private Personal Information. This may be
				used for any purposes, including without limitation internal use.
			</p>
			<h2 className="text-2xl font-semibold mb-2 mt-6">
				Data Usage Policy: Non Personal Browsing and Site Usage Information
			</h2>
			<p>
				Non-Personal Browsing Information We Collect. When you use the Websites, our servers (which may be
				hosted by a third party service provider) may collect information indirectly and automatically (through,
				for example, the use of your “IP address”) about your activities while visiting the Websites and
				information about the browser you are using. In addition, whenever you log into a website, our servers
				(which, again, may be hosted by a third party service provider) keep a log of the pages you visit and
				when you visit them.
			</p>
			<p className="mt-2">
				Notice. If JustAJobApp is required to provide a third party with your non personal browsing information
				or to log in on behalf of a user (whether by subpoena or otherwise), then JustAJobApp will use
				reasonable means to notify you promptly of that event, unless JustAJobApp is prohibited by law from
				doing so or is otherwise advised not to notify you on the advice of legal counsel.
			</p>
			<p className="mt-2">
				No Selling or Sharing. Except in the unique situations identified in this Privacy Policy, JustAJobApp
				does not sell or otherwise voluntarily provide the non-personal browsing information we collect about
				you or your website usage to third parties.
			</p>
			<p className="mt-2">
				Any other non-personal information that we collect which is not described specifically in this Privacy
				Policy will only be collected and used in accordance with the Principles.
			</p>
			<h2 className="text-2xl font-semibold mb-2 mt-6">Third-Party Email Synchronization</h2>
			<p className="mt-2">
				JustAJobApp allows you to connect your Google account specifically for the following purposes:
			</p>
			<ul className="list-disc list-inside space-y-2 mt-2">
				<li>
					<strong>Reading and Analyzing your Mailbox to:</strong>
					<ul className="list-disc list-inside space-y-1 mt-1 ml-4">
						<li>Identify and extract information from job application-related emails.</li>
						<li>
							Automatically capture key details such as <strong>Company Name</strong>,{" "}
							<strong>Job Title</strong>, and <strong>Application Status</strong> (e.g., Applied,
							Interviewing, Rejected).
						</li>
						<li>
							Aggregate received email statistics to provide a visual dashboard of your job search
							progress.
						</li>
						<li>Display structured summaries of emails related to your job applications within the App.</li>
					</ul>
				</li>
				<li>
					<strong>Background Synchronization:</strong>
					<ul className="list-disc list-inside space-y-1 mt-1 ml-4">
						<li>
							Periodically check for updates to your existing applications or new submissions without
							requiring you to manually trigger a fetch.
						</li>
					</ul>
				</li>
				<li>
					<strong>Incremental Synchronization:</strong>
					<ul className="list-disc list-inside space-y-1 mt-1 ml-4">
						<li>
							Reviews the timestamp of your last processed email by the App to only request messages
							received after that date.
						</li>
					</ul>
				</li>
			</ul>
			<p className="mt-2">JustAJobApp requires the following permissions for connected Google accounts:</p>
			<ul className="list-disc list-inside space-y-2 mt-2">
				<li>
					<strong>Read all your email from Gmail:</strong> This allows our filters to scan for relevant
					job-related headers and content to ensure no application update is missed.
				</li>
			</ul>
			<p className="mt-2">
				JustAJobApp provides the functionality outlined above using the <strong>Google OAuth2</strong> framework
				and the <strong>Gmail API</strong>. Rather than acting as a traditional, all-purpose email client like
				Outlook or Apple Mail, JustAJobApp serves as a <strong>specialized data processor</strong> designed
				specifically to organize and analyze your job search history. By utilizing secure, encrypted{" "}
				<strong>refresh tokens</strong> instead of your account password, the App maintains the ability to check
				for updates in the background without requiring you to be actively logged in.
			</p>
			<p className="mt-2">The Gmail API allows for filtering:</p>
			<ul className="list-disc list-inside space-y-2 mt-2">
				<li>
					<strong>Initial Discovery:</strong> The App first identifies potential job-related messages based on
					the keywords and criteria defined in our{" "}
					<a
						className="text-blue-600 hover:underline"
						href="https://github.com/JustAJobApp/jobseeker-analytics/blob/main/backend/email_query_filters/applied_email_filter.yaml"
					>
						applied_email_filter.yaml
					</a>
					.
				</li>
				<li>
					<strong>Intelligent Analysis:</strong> An intelligent analysis layer defined in our{" "}
					<a
						className="text-blue-600 hover:underline"
						href="https://github.com/JustAJobApp/jobseeker-analytics/blob/main/backend/utils/llm_utils.py"
					>
						llm_utils.py
					</a>{" "}
					then evaluates these messages to discard "false positives" (such as marketing newsletters) and
					ensure unrelated personal data is not processed.
				</li>
				<li>
					<strong>Domain-Based Optimization:</strong> Over time, as job applications are verified, future
					fetches may also rely on <strong>stored email domains</strong> from job-related emails to ensure
					accurate and reliable tracking of your ongoing communications.
				</li>
			</ul>
			<p className="mt-2">
				Google requires these specific API permissions to enable this secure, targeted synchronization while
				maintaining the highest standards of data privacy. JustAJobApp will access your basic profile
				information, including your name and email address, so we can properly synchronize with your account and
				maintain your user session.
			</p>
			<h2 className="text-2xl font-semibold mb-2 mt-6">Compliance to the Google API Services User Data Policy</h2>
			<p>
				JustAJobApp’s use and transfer to any other app of information received from Google APIs will adhere to
				the{" "}
				<a
					className="text-blue-600 hover:underline"
					href="https://developers.google.com/terms/api-services-user-data-policy"
				>
					Google API Services User Data Policy
				</a>
				, including the Limited Use requirements.
			</p>
			<p className="mt-2">Specifically:</p>
			<ul className="list-disc list-inside space-y-2 mt-2">
				<li>
					<strong>No Human Access:</strong> We do not allow humans to read this data unless we have your
					affirmative agreement for specific messages (for example, for career coaching services or technical
					support).
				</li>
				<li>
					<strong>No Transfer:</strong> We do not transfer this data to third parties for targeted advertising
					or any other purpose, except to provide the app's core features (e.g., sharing with your Career
					Coach upon your request) or to comply with applicable law.
				</li>
				<li>
					<strong>No Use for Advertising:</strong> We do not use this data to serve advertisements.
				</li>
				<li>
					<strong>No Use for AI Training:</strong> We do not use data obtained from Google Workspace APIs to
					train generalized artificial intelligence and/or machine learning models.
				</li>
			</ul>
			<section>
				<h2 className="text-2xl font-semibold mb-2">Artificial Intelligence-Based Products</h2>
				<p>
					We offer features powered by artificial intelligence, including <strong>Google Cloud AI</strong> and{" "}
					<strong>Google Gemini API</strong>, to provide text analysis and content summarization. Your input
					and personal information are processed by these AI Service Providers solely to enable these
					features.
				</p>
			</section>
			<p className="mt-2">To provide support:</p>
			<ul className="list-disc list-inside space-y-2 mt-2">
				<li>
					In some cases, our engineers may use internal support tools to help troubleshoot the mailbox
					synchronization process. They may need to locate individual emails related to a Job Application or
					from a specific domain in response to a support request, a bug report or to investigate security or
					performance issues. Use of these tools in production on customer data must be authorized by
					JustAJobApp LLC.
				</li>
			</ul>
			<p className="mt-2">
				JustAJobApp will NOT disclose information, even in anonymized, aggregate or derivative forms, that is
				made available by our connections to third party email providers. We will act in accordance to and
				adhere to the privacy requirements outlined by Google’s Additional Requirements for Restricted Scopes.
			</p>
			<p className="mt-2">
				Note that records of financial transactions will be maintained for approximately seven years, based on
				Internal Revenue Service (IRS) guidance for taxation record keeping
			</p>
			<h2 className="text-2xl font-semibold mb-2 mt-6">Reorganization or Spin-Offs</h2>
			<p>
				JustAJobApp may transfer some or all of your personal and/or non personal browsing information to a
				third party as a result of a reorganization, spin-off or similar transaction. Upon such transfer, the
				acquirer’s privacy policy will apply. In such event, JustAJobApp will use reasonable efforts to notify
				you and to ensure that at the time of the transaction the acquirer’s privacy policy complies with the
				Principles.
			</p>
			<h2 className="text-2xl font-semibold mb-2 mt-6">Third-Party Sites</h2>
			<p>
				The Websites may include links to other websites. You should consult the respective privacy policies of
				these third-party sites. This Privacy Policy does not apply to, and we cannot control the activities of,
				such other websites.
			</p>
			<h2 className="text-2xl font-semibold mb-2 mt-6">Special Note to International Users</h2>
			<p>
				The Websites are hosted in the United States. If you are accessing the Websites from the European Union,
				Asia, or any other region with laws or regulations governing personal data collection, use and
				disclosure that differ from United States laws, please note that you are transferring your personal data
				to the United States which does not have the same data protection laws as the EU and other regions. By
				providing your personal data you consent to:
			</p>
			<ul className="list-disc list-inside space-y-2 mt-2">
				<li>
					the use of your personal data for the uses identified above in accordance with the Privacy Policy;
					and
				</li>
				<li>the transfer of your personal data to the United States as indicated above.</li>
			</ul>
			<h2 className="text-2xl font-semibold mb-2 mt-6">Changes and Updates to this Privacy Policy</h2>
			<p>
				We may occasionally update this Privacy Policy. When we do, we will also revise the Effective Date at
				the top of this page. We encourage you to periodically review this Privacy Policy to stay informed about
				how we are protecting the personal information we collect. Your continued use of the Websites
				constitutes your agreement to this Privacy Policy and any updates.
			</p>
			<h2 className="text-2xl font-semibold mb-4 mt-8 border-t pt-4">7. Contact Information</h2>
			<div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
				<p className="font-bold">JustAJobApp LLC</p>
				<p>2108 N St, STE N</p>
				<p>Sacramento, CA 95816</p>
				<p>United States</p>
				<p className="mt-2">
					Email:{" "}
					<a className="text-blue-600 underline" href="mailto:privacy@justajobapp.com">
						privacy@justajobapp.com
					</a>
				</p>
			</div>
		</main>
	);
};

export default PrivacyPolicyPage;
