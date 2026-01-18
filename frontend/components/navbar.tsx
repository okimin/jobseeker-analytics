"use client";

import { useState } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";

export const Navbar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const pathname = usePathname();
	const { theme } = useTheme();

	return (
		<nav className="sticky top-0 z-50 bg-background dark:bg-content1 shadow-md border-b border-divider">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<NextLink className="flex items-center gap-3" href="/">
								<img
									alt="JustAJobApp Logo"
									className="h-10 w-10 object-contain"
									src={
										theme === "dark"
											? "/justajobapp-square-dark-monogram-logo-favicon.png"
											: "/justajobapp-circle-monogram-logo-social.png"
									}
								/>
								<div className="flex flex-col">
									<span className="text-xl font-bold text-foreground">{siteConfig.name}</span>
									<span className="text-xs text-default-500 -mt-1">{siteConfig.description}</span>
								</div>
							</NextLink>
						</div>
						<div className="hidden md:block">
							<div className="ml-10 flex items-baseline space-x-4">
								{siteConfig.navItems.map((item) => (
									<NextLink
										key={item.href}
										className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
											pathname === item.href
												? "bg-primary hover:bg-primary-600 text-primary-foreground"
												: "text-foreground/80 hover:bg-content2 hover:text-foreground"
										}`}
										href={item.href}
									>
										{item.label}
									</NextLink>
								))}
							</div>
						</div>
					</div>
					<div className="hidden md:block">
						<div className="flex items-center space-x-4">
							<ThemeSwitch />

							<a
								className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-primary hover:bg-primary-600"
								href={siteConfig.links.waitlist}
								rel="noopener noreferrer"
								target="_blank"
							>
								Sign up
							</a>
						</div>
					</div>
					<div className="-mr-2 flex md:hidden">
						<button
							aria-controls="mobile-menu"
							aria-expanded="false"
							className="bg-content2 inline-flex items-center justify-center p-2 rounded-md text-foreground/80 hover:text-foreground hover:bg-content3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
							type="button"
							onClick={() => setIsOpen(!isOpen)}
						>
							<span className="sr-only">Open main menu</span>
							{!isOpen ? (
								<svg
									aria-hidden="true"
									className="block h-6 w-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M4 6h16M4 12h16M4 18h16"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
									/>
								</svg>
							) : (
								<svg
									aria-hidden="true"
									className="block h-6 w-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M6 18L18 6M6 6l12 12"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
									/>
								</svg>
							)}
						</button>
					</div>
				</div>
			</div>

			{isOpen && (
				<div className="md:hidden" id="mobile-menu">
					<div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
						{siteConfig.navItems.map((item) => (
							<NextLink
								key={item.href}
								className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
									pathname === item.href
										? "bg-primary text-primary-foreground"
										: "text-foreground/80 hover:bg-content2 hover:text-foreground"
								}`}
								href={item.href}
								onClick={() => setIsOpen(false)}
							>
								{item.label}
							</NextLink>
						))}
					</div>
				</div>
			)}
		</nav>
	);
};
