"use client";

import { useState, useEffect } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

import { siteConfig } from "@/config/site";
import { checkAuth } from "@/utils/auth";

interface NavbarProps {
	defaultCollapsed?: boolean;
}

export const Navbar = ({ defaultCollapsed = false }: NavbarProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const pathname = usePathname();
	const { theme } = useTheme();
	const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

	useEffect(() => {
		checkAuth(apiUrl).then((authenticated) => {
			setIsAuthenticated(authenticated);
		});
	}, [apiUrl]);

	// Collapsed navbar - just logo and expand button
	if (isCollapsed) {
		return (
			<nav className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-md">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-12">
						<NextLink className="flex items-center gap-2" href="/">
							<img
								alt="JustAJobApp Logo"
								className="h-8 w-8 object-contain"
								src={
									theme === "dark"
										? "/justajobapp-square-dark-monogram-logo-favicon.png"
										: "/justajobapp-circle-monogram-logo-social.png"
								}
							/>
							<span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-emerald-600 dark:text-orange-400">
								{siteConfig.name}
							</span>
						</NextLink>
						<button
							className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
							title="Expand navbar"
							onClick={() => setIsCollapsed(false)}
						>
							<svg
								className="h-5 w-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									d="M19 9l-7 7-7-7"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
								/>
							</svg>
						</button>
					</div>
				</div>
			</nav>
		);
	}

	return (
		<nav className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-md">
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
									<span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-emerald-600 dark:text-orange-400">
										{siteConfig.name}
									</span>
									<span className="text-xs text-default-500 -mt-1">{siteConfig.description}</span>
								</div>
							</NextLink>
						</div>
						<div className="hidden md:block">
							<div className="ml-10 flex items-baseline space-x-4">
								{siteConfig.navItems.map((item) => (
									<NextLink
										key={item.href}
										className={`px-3 py-2 rounded-md text-sm font-medium ${
											pathname === item.href
												? "bg-gray-900 text-white"
												: "text-gray-700 dark:text-gray-300 hover:bg-gray-700 hover:text-white"
										}`}
										href={item.href}
									>
										{item.label}
									</NextLink>
								))}
							</div>
						</div>
					</div>
					<div className="hidden md:flex items-center space-x-4">
						{isAuthenticated ? (
							<>
								<NextLink
									className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
									href="/dashboard"
								>
									Dashboard
								</NextLink>
								<NextLink
									className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
									href="/logout"
								>
									Log out
								</NextLink>
							</>
						) : (
							<>
								<NextLink
									className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600"
									href="/login"
								>
									Login
								</NextLink>
								<NextLink
									className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-yellow-400 hover:bg-yellow-500"
									href="/login?signup=true"
								>
									Sign up
								</NextLink>
							</>
						)}
						<button
							className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
							title="Collapse navbar"
							onClick={() => setIsCollapsed(true)}
						>
							<svg
								className="h-5 w-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									d="M5 15l7-7 7 7"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
								/>
							</svg>
						</button>
					</div>
					<div className="-mr-2 flex md:hidden">
						<button
							aria-controls="mobile-menu"
							aria-expanded="false"
							className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
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
								className={`block px-3 py-2 rounded-md text-base font-medium ${
									pathname === item.href
										? "bg-gray-900 text-white"
										: "text-gray-700 dark:text-gray-300 hover:bg-gray-700 hover:text-white"
								}`}
								href={item.href}
								onClick={() => setIsOpen(false)}
							>
								{item.label}
							</NextLink>
						))}
						{/* Auth buttons for mobile */}
						<div className="pt-4 border-t border-gray-700">
							{isAuthenticated ? (
								<>
									<NextLink
										className="block px-3 py-2 rounded-md text-base font-medium text-white bg-emerald-600 hover:bg-emerald-700"
										href="/dashboard"
										onClick={() => setIsOpen(false)}
									>
										Dashboard
									</NextLink>
									<NextLink
										className="block px-3 py-2 mt-1 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
										href="/logout"
										onClick={() => setIsOpen(false)}
									>
										Log out
									</NextLink>
								</>
							) : (
								<>
									<NextLink
										className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-700 hover:text-white"
										href="/login"
										onClick={() => setIsOpen(false)}
									>
										Login
									</NextLink>
									<NextLink
										className="block px-3 py-2 mt-1 rounded-md text-base font-medium text-black bg-yellow-400 hover:bg-yellow-500"
										href="/login?signup=true"
										onClick={() => setIsOpen(false)}
									>
										Sign up
									</NextLink>
								</>
							)}
						</div>
					</div>
				</div>
			)}
		</nav>
	);
};
