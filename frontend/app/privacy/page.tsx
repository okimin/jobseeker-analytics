import React from "react";

const PrivacyPolicyPage = () => {
	return (
		<main className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
			<p className="text-sm text-gray-500 mb-6">Effective Date: December 25, 2025</p>

			<div className="space-y-6">
				<section>
					<h2 className="text-2xl font-semibold mb-2">Fundamental Principles of our Privacy Policy</h2>
					<p>
						Your privacy is extremely important to us. We have a few fundamental principles that we adhere
						to:
					</p>
					<ul className="list-disc list-inside space-y-2 mt-2">
						<li>
							We <strong>WILL NOT</strong> ask you for personal information unless we need it. (It’s shady
							to ask for your income level, number of kids, etc. for no apparent reason.)
						</li>
						<li>
							We <strong>WILL NOT</strong> share your personally identifiable information outside the
							Company except to comply with the law, where necessary to conduct our business (such as with
							your designated Career Coach), or to provide the core service.
						</li>
						<li>
							We <strong>WILL NOT</strong> do anything that would make us feel uncomfortable if it were
							our personal information.
						</li>
					</ul>
					<p className="mt-2">Those are our guiding principles when it comes to how we treat your data.</p>
				</section>

				<section>
					<h2 className="text-2xl font-semibold mb-2">Privacy Policy</h2>
					<p>
						This Master Privacy Policy (“Privacy Policy”) explains the collection, use, and disclosure of
						“personal information” by <strong>JustAJobApp LLC</strong> (doing business as{" "}
						<strong>JustAJobApp</strong>) (“the Company”), a California Limited Liability Company.
					</p>
					<p className="mt-2">
						This Privacy Policy includes products and services provided through websites that JustAJobApp
						LLC operates (collectively, together with all sub-domains thereof including, without limitation,
						the “Websites”) and the JustAJobApp application.
					</p>
					<p className="mt-2">
						As used in this policy, “personal information” means information that would allow a party to
						identify you, such as your name, email address, job search data, and job titles.
					</p>
					<p className="mt-2">
						By accessing the Websites or using the JustAJobApp applications, you are accepting and agreeing
						to the practices described in this Privacy Policy.
					</p>
				</section>

				<section>
					<h2 className="text-2xl font-semibold mb-2">Disclosures of Personal Information</h2>
					<p>
						In general, it is not JustAJobApp LLC’s practice to disclose personal information to third
						parties. We may share personal information in two instances:
					</p>
					<p className="mt-2">
						<strong>First</strong>, JustAJobApp LLC may share personal information with our contractors and
						service providers in order to maintain, enhance, or add to the functionality of the Websites or
						third-party products that we integrate with. A prime example of this is{" "}
						<strong>ConvertKit</strong>, which is one of our email service providers. Another example would
						be <strong>Stripe</strong>, which is the service provider we use for processing payments , or{" "}
						<strong>Google Cloud AI</strong> which we use for text analysis features.
					</p>
					<p className="mt-2">
						<strong>Second</strong>, we may disclose your personal information to third parties in a good
						faith belief that such disclosure is reasonably necessary to (a) take action regarding suspected
						illegal activities; (b) enforce or apply our Master Terms of Use and Privacy Policy; (c) comply
						with legal process, such as a search warrant, subpoena, statute, or court order; or (d) protect
						our rights, reputation, and property, or that of our users, affiliates, or the public .
					</p>
					<p className="mt-2">
						If JustAJobApp LLC is required to provide a third party with your personal information (whether
						by subpoena or otherwise), then provided we have collected and retained an email address for
						you, JustAJobApp LLC will use reasonable means to notify you promptly of that event, unless
						prohibited by law or JustAJobApp LLC is otherwise advised not to notify you on the advice of
						legal counsel.
					</p>
				</section>

				<section>
					<h2 className="text-2xl font-semibold mb-2">
						Disclosure of Anonymized and/or Aggregated Information
					</h2>
					<p>
						JustAJobApp LLC reserves the right to use and disclose anonymized and/or aggregated information,
						whether public or private so long as it has not been combined with private Personal Information.
						This may be used for any purposes, including without limitation internal use.
					</p>
				</section>

				<section>
					<h2 className="text-2xl font-semibold mb-2">
						Data Usage Policy: Non-Personal Browsing and Site Usage Information
					</h2>
					<p>
						<strong>Non-Personal Browsing Information We Collect.</strong> When you use the Websites, our
						servers (which may be hosted by a third-party service provider such as Amazon Web Services ) may
						collect information indirectly and automatically (through, for example, the use of your “IP
						address”) about your activities while visiting the Websites and information about the browser
						you are using. In addition, whenever you log into a website, our servers keep a log of the pages
						you visit and when you visit them.
					</p>
					<p className="mt-2">
						<strong>Notice.</strong> If JustAJobApp LLC is required to provide a third party with your
						non-personal browsing information or to log in on behalf of a user (whether by subpoena or
						otherwise), then JustAJobApp LLC will use reasonable means to notify you promptly of that event,
						unless JustAJobApp LLC is prohibited by law from doing so.
					</p>
					<p className="mt-2">
						<strong>No Selling or Sharing.</strong> Except in the unique situations identified in this
						Privacy Policy, JustAJobApp LLC does not sell or otherwise voluntarily provide the non-personal
						browsing information we collect about you or your website usage to third parties.
					</p>
				</section>

				<section>
					<h2 className="text-2xl font-semibold mb-2">Third-Party Email Synchronization (Google Gmail)</h2>
					<p>
						JustAJobApp allows you to connect to your third-party email accounts (specifically Gmail) for
						the following purposes:
					</p>
					<ul className="list-disc list-inside space-y-2 mt-2">
						<li>
							Reading your mailbox to:
							<ul className="list-disc list-inside ml-6">
								<li>Identify job application confirmations, rejections, and updates.</li>
								<li>Identify interview invitations and related calendar notifications.</li>
								<li>
									Parse specific data points (Company Name, Job Title, Application Status, Contact
									Date) to populate your dashboard.
								</li>
							</ul>
						</li>
					</ul>
					<p className="mt-2">
						JustAJobApp requires the following permissions for connected Google accounts:
					</p>
					<ul className="list-disc list-inside space-y-2 mt-2">
						<li>
							<strong>View your email messages and settings (ReadOnly):</strong> To find and parse
							job-related emails.
						</li>
					</ul>
					<p className="mt-2">
						JustAJobApp provides the functionality outlined above using secure APIs (such as the Gmail API).
						We access your account only to provide the specific utility of tracking your job search.
					</p>
				</section>

				<section>
					<h2 className="text-2xl font-semibold mb-2">
						Compliance to the Google API Services User Data Policy
					</h2>
					<p>
						JustAJobApp’s use and transfer to any other app of information received from Google APIs will
						adhere to the{" "}
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
							<strong>No Human Access:</strong> We do not allow humans to read this data unless we have
							your affirmative agreement for specific messages (for example, for technical support).
						</li>
						<li>
							<strong>No Transfer:</strong> We do not transfer this data to third parties for targeted
							advertising or any other purpose, except to provide the app's core features (e.g., sharing
							with your Career Coach upon your request) or to comply with applicable law.
						</li>
						<li>
							<strong>No Use for Advertising:</strong> We do not use this data to serve advertisements.
						</li>
						<li>
							<strong>No Use for AI Training:</strong> We do not use data obtained from Google Workspace
							APIs to train generalized artificial intelligence and/or machine learning models.
						</li>
					</ul>
				</section>

				<section>
					<h2 className="text-2xl font-semibold mb-2">Artificial Intelligence-Based Products</h2>
					<p>
						We offer features powered by artificial intelligence, including <strong>Google Cloud AI</strong>{" "}
						and <strong>Google Gemini API</strong>, to provide text analysis and content summarization. Your
						input and personal information are processed by these AI Service Providers solely to enable
						these features. We ensure that data sent to these providers is strictly for processing purposes
						and is not used to train their generalized models.
					</p>
				</section>

				<section>
					<h2 className="text-2xl font-semibold mb-2">Data Deletion Requests</h2>
					<p>
						You have the right to request access to the personal information we collect from you, correct
						inaccuracies, or delete your personal information.
					</p>
					<p className="mt-2">
						To request to review, update, or delete your personal information, please fill out and submit a
						data subject access request here:
					</p>
					<p className="mt-2">
						<a
							className="text-blue-600 hover:underline"
							href="https://app.termly.io/dsar/a8dc31e4-d96a-461e-afe0-abdec759bc97"
						>
							https://app.termly.io/dsar/a8dc31e4-d96a-461e-afe0-abdec759bc97
						</a>
					</p>
				</section>

				<section>
					<h2 className="text-2xl font-semibold mb-2">Reorganization or Spin-Offs</h2>
					<p>
						JustAJobApp LLC may share or transfer your information in connection with, or during
						negotiations of, any merger, sale of company assets, financing, or acquisition of all or a
						portion of our business to another company. Upon such transfer, the acquirer’s privacy policy
						will apply.
					</p>
				</section>

				<section>
					<h2 className="text-2xl font-semibold mb-2">Third-Party Sites</h2>
					<p>
						The Websites may include links to other websites. You should consult the respective privacy
						policies of these third-party sites. This Privacy Policy does not apply to, and we cannot
						control the activities of, such other websites.
					</p>
				</section>

				<section>
					<h2 className="text-2xl font-semibold mb-2">Special Note to International Users</h2>
					<p>
						The Websites are hosted in the <strong>United States</strong>. If you are accessing the Websites
						from the European Union, Asia, or any other region with laws or regulations governing personal
						data collection, use, and disclosure that differ from United States laws, please note that you
						are transferring your personal data to the United States.
					</p>
					<p className="mt-2">
						If you are a resident in the European Economic Area (EEA), United Kingdom (UK), or Switzerland,
						we have implemented measures to protect your personal information, including the European
						Commission's Standard Contractual Clauses for transfers of personal information.
					</p>
				</section>

				<section>
					<h2 className="text-2xl font-semibold mb-2">Changes and Updates to this Privacy Policy</h2>
					<p>
						We may occasionally update this Privacy Policy. The updated version will be indicated by an
						updated "Effective Date" at the top of this Privacy Policy.
					</p>
				</section>

				<section>
					<h2 className="text-2xl font-semibold mb-2">Contact Us</h2>
					<p>
						If you have questions or comments about this policy, you may email us at{" "}
						<strong>privacy@justajobapp.com</strong> or by post to:
					</p>
					<address className="not-italic mt-2">
						JustAJobApp LLC
						<br />
						c/o Northwest Registered Agent, Inc.
						<br />
						2108 N ST, STE N
						<br />
						Sacramento, CA 95816, USA
					</address>
				</section>
			</div>
		</main>
	);
};

export default PrivacyPolicyPage;
