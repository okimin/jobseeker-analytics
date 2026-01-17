"use client";

import { siteConfig } from "@/config/site";

const Footer = () => {
	return (
		<footer className="w-full border-t border-divider bg-content1 dark:bg-content1 p-6">
			<div className="container mx-auto max-w-7xl">
				<div className="flex flex-col items-center justify-center gap-4 md:flex-row">
					<p className="text-sm text-foreground/70">
						© {new Date().getFullYear()} {siteConfig.legalName}
					</p>
					<div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
						<a
							className="text-sm text-primary hover:text-primary-600 hover:underline transition-colors"
							href={siteConfig.links.termsAndConditions}
							rel="noopener noreferrer"
							target="_blank"
						>
							Terms of Use
						</a>
						{" | "}
						<a
							className="text-sm text-primary hover:text-primary-600 hover:underline transition-colors"
							href={siteConfig.links.privacyPolicy}
							rel="noopener noreferrer"
							target="_blank"
						>
							Privacy Policy
						</a>
						{" | "}
						<a
							className="text-sm text-primary hover:text-primary-600 hover:underline transition-colors"
							href={siteConfig.links.support}
							rel="noopener noreferrer"
							target="_blank"
						>
							Support
						</a>
						{" | "}
						<a
							className="text-sm text-primary hover:text-primary-600 hover:underline transition-colors"
							href={siteConfig.links.feedback}
							rel="noopener noreferrer"
							target="_blank"
						>
							<span className="mr-1">💬</span>
							Give Feedback
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
