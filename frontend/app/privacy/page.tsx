import React from "react";

const PrivacyPolicyPage = () => {
	return (
		<main className="container mx-auto px-4 py-8">
			<h2 className="text-2xl font-semibold mb-2">Fundamental Principles of our Privacy Policy</h2>
			<p>Your privacy is extremely important to us. We have a few fundamental principles that we adhere to:</p>
			<ul className="list-disc list-inside space-y-2 mt-2">
				<li>
					We WILL NOT ask you for personal information unless we need it. (It’s shady to ask for your income
					level, number of kids, etc for no apparent reason.)
				</li>
				<li>
					We WILL NOT share your personally identifiable information outside the Company except to comply to
					the law or where necessary to conduct business.
				</li>
				<li>
					We WILL NOT do anything that would make us feel uncomfortable if it were our personal information.
				</li>
			</ul>
			<p className="mt-2">
				Those are our guiding principles when it comes to how we treat your data. Below are the specifics of our
				privacy policy. Astute readers will note that much of our privacy policy is based heavily on the
				Creative Commons Privacy Policy.
			</p>
			<h2 className="text-2xl font-semibold mb-2 mt-6">Privacy Policy</h2>
			<p>
				This Master Privacy Policy (“Privacy Policy”) explains the collection, use, and disclosure of “personal
				information” by JustAJobApp LLC, a California Limited Liability Company. This Privacy Policy includes
				products and services provided through websites that JustAJobApp operates, which include, but are not
				limited to the justajobapp.com domain (collectively, together with all sub-domains thereof including,
				without limitation, the “Websites”). This Privacy Policy does not apply to any of the websites operated
				by affiliates of JustAJobApp. This Privacy Policy also explains our commitment to you with respect to
				our use and disclosure of non personal browsing and site usage data that JustAJobApp collects as the
				provider of the Websites. That commitment is contained in a “Data Usage Policy,” below.
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
			JustAJobApp allows you to connect your Google account specifically for the following purposes: * **Reading
			and Analyzing your Mailbox to:** * Identify and extract information from job application-related emails. *
			Automatically capture key details such as **Company Name**, **Job Title**, and **Application Status** (e.g.,
			Applied, Interviewing, Rejected). * Aggregate received email statistics to provide a visual dashboard of
			your job search progress. * Display structured summaries of emails related to your job applications within
			the App. * **Background Synchronization:** * Periodically check for updates to your existing applications or
			new submissions without requiring you to manually trigger a fetch. JustAJobApp requires the following
			permissions for connected Google accounts: * **Read all your email from Gmail:** This allows our filters to
			scan for relevant job-related headers and content to ensure no application update is missed. JustAJobApp
			provides the functionality outlined above using the **Google OAuth2** framework and the **Gmail API**.
			Rather than acting as a traditional, all-purpose email client like Outlook or Apple Mail, JustAJobApp serves
			as a **specialized data processor** designed specifically to organize and analyze your job search history.
			By utilizing secure, encrypted **refresh tokens** instead of your account password, the App maintains the
			ability to check for updates in the background without requiring you to be actively logged in. The Gmail API
			was selected specifically to allow for sophisticated, multi-layered filtering: * **Initial Discovery:** The
			App first identifies potential job-related messages based on the keywords and criteria defined in our
			[applied_email_filter.yaml](https://github.com/JustAJobApp/jobseeker-analytics/blob/main/backend/email_query_filters/applied_email_filter.yaml).
			* **Intelligent Analysis:** An intelligent analysis layer then evaluates these messages to discard "false
			positives" (such as marketing newsletters) and ensure unrelated personal data is not processed. *
			**Domain-Based Optimization:** Over time, as job applications are verified, future fetches may also rely on
			**stored email domains** from these employers to ensure accurate and reliable tracking of your ongoing
			communications. Google requires these specific API permissions to enable this secure, targeted
			synchronization while maintaining the highest standards of data privacy. JustAJobApp will access your basic
			profile information, including your name and email address, so we can properly synchronize with your account
			and maintain your user session.
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
			<p className="mt-2">Regardless of the third-party email provider:</p>
			<ul className="list-disc list-inside space-y-2 mt-2">
				<li>
					JustAJobApp periodically checks your mailbox for new messages using the Google Gmail API. Unlike
					traditional email clients, the App does not store your password; instead, it uses a secure,
					encrypted "refresh token" to maintain access solely for the purpose of identifying job application
					updates.
				</li>
				<li>
					To ensure efficiency and minimize data transfer, the App performs incremental synchronization. It
					uses the timestamp of your last processed email to only request messages received after that date.
					These emails are then retrieved via API and queued for intelligent processing.
				</li>
				<li>
					As part of the post-synchronization phase, the App uses advanced processing to analyze the content
					of newly discovered emails. This allows the application to automatically extract company names,
					application statuses, and job titles, ensuring your dashboard remains up-to-date without requiring
					manual entry.
				</li>
				<li>
					This API-driven approach allows the synchronization to resume exactly where it left off in the event
					of a network interruption, ensuring no data is lost or duplicated. To prioritize your privacy,
					JustAJobApp initially retrieves emails matching a specific set of job-search criteria (such as
					"application received" or "interview invitation"). The exact logic for these initial filters is
					maintained transparently in our applied_email_filter.yaml configuration. While our filters are
					highly specific, we recognize that unrelated emails may occasionally be captured. To account for
					this, every fetched email undergoes a second layer of intelligent analysis. If this processor
					identifies a "false positive"—such as a marketing newsletter or unrelated notification—the email is
					immediately discarded and is not saved to your account. Emails that successfully pass this second
					layer of analysis will have extracted subject lines, sender email, company name, job title, and
					application status stored securely in your dashboard to provide the analytics and tracking features
					of the App. This storage allows you to review your application history, status changes, and
					communication timelines in one place. Once an email is verified as job-related, JustAJobApp may
					extract and store the sender's company domain. For future synchronizations, the App can rely on
					these verified domains to identify new messages directly. This transition from broad keyword
					filtering to specific domain-based fetching improves accuracy and ensures that future communications
					from potential employers are captured even if they use unconventional wording that might bypass
					standard filters.
				</li>
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
			<h2 className="text-2xl font-semibold mb-2 mt-6">Data Deletion Requests</h2>
			<p>
				You may request that your account information be deleted at any time by sending an email to
				privacy@justajobapp.com. Upon receiving a valid request, we will mark your data for deletion and delete
				it within 90 days.
			</p>
			<p className="mt-2">
				Note that records of financial transactions will be maintained for approximately seven years, based on
				Internal Revenue Service(IRS) guidance for taxation record keeping
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
				We may occasionally update this Privacy Policy. When we do, we will also revise the Effective Date
				below. We encourage you to periodically review this Privacy Policy to stay informed about how we are
				protecting the personal information we collect. Your continued use of the Websites constitutes your
				agreement to this Privacy Policy and any updates.
			</p>
			<p className="mt-2">Effective Date: December 25, 2025</p>
		</main>
	);
};

export default PrivacyPolicyPage;
