"use client";

import { siteConfig } from "@/config/site";

const Footer = () => {
	return (
		<footer className="w-full border-t border-divider p-6">
			<div className="container mx-auto max-w-7xl">
				<div className="flex flex-col items-center justify-center gap-4 md:flex-row">
					<p className="text-sm text-default-600">© {new Date().getFullYear()}{" "}{siteConfig.legalName}</p>
					<div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
						<a
							className="text-sm text-primary-500 hover:underline"
							href={siteConfig.links.termsAndConditions}
							rel="noopener noreferrer"
							target="_blank"
						>
							Terms of Use
						</a>
						{" | "}
						<a
							className="text-sm text-primary-500 hover:underline"
							href={siteConfig.links.privacyPolicy}
							rel="noopener noreferrer"
							target="_blank"
						>
							Privacy Policy
						</a>
						{" | "}
						<a
							className="text-sm text-primary-500 hover:underline"
							href={siteConfig.links.support}
							rel="noopener noreferrer"
							target="_blank"
						>
							Support
						</a>
						{" | "}
						<a
							className="text-sm text-primary-500 hover:underline"
							href={siteConfig.links.community}
							rel="noopener noreferrer"
							target="_blank"
						>
							<span className="mr-1">👋</span>
							Community
						</a>
						{" | "}
						<a
							className="text-sm text-primary-500 hover:underline"
							href={siteConfig.links.coffee}
							rel="noopener noreferrer"
							target="_blank"
						>
							<span className="mr-1">☕</span>
							Buy Us a Coffee
						</a>
						{" | "}
						<a
							className="text-sm text-primary-500 hover:underline"
							href={siteConfig.links.feedback}
							rel="noopener noreferrer"
							target="_blank"
						>
							<span className="mr-1">💬</span>
							Feedback
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
