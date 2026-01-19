"use client";

import { useState, useEffect } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

import { siteConfig } from "@/config/site";
import { checkAuth } from "@/utils/auth";
import PaymentAsk from "@/components/PaymentAsk";

interface NavbarProps {
	defaultCollapsed?: boolean;
	onDonateClick?: () => void;
}

export const Navbar = ({ defaultCollapsed = false, onDonateClick }: NavbarProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [showPaymentModal, setShowPaymentModal] = useState(false);
	const pathname = usePathname();
	const { theme } = useTheme();
	const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

	useEffect(() => {
		checkAuth(apiUrl).then((authenticated) => {
			setIsAuthenticated(authenticated);
		});
	}, [apiUrl]);

	// Handle donate click - use external handler if provided, otherwise use internal modal
	const handleDonateClick = () => {
		if (onDonateClick) {
			onDonateClick();
		} else {
			setShowPaymentModal(true);
		}
	};

	// Determine what the primary CTA button should show
	const getPrimaryCTA = () => {
		if (isAuthenticated && pathname === "/dashboard") {
			return { label: "Logout", href: "/logout" };
		}
		if (isAuthenticated) {
			return { label: "Dashboard", href: "/dashboard" };
		}
		return { label: "Login", href: "/login" };
	};

	const primaryCTA = getPrimaryCTA();

	// Collapsed navbar - just logo and expand button
	if (isCollapsed) {
		return (
			<nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm">
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
							<span className="text-lg font-semibold text-gray-900 dark:text-white">
								{siteConfig.name}
							</span>
						</NextLink>
						<button
							className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-md"
							title="Expand navbar"
							onClick={() => setIsCollapsed(false)}
						>
							<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
							</svg>
						</button>
					</div>
				</div>
			</nav>
		);
	}

	return (
		<nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Logo and brand - left side */}
					<div className="flex items-center">
						<NextLink className="flex items-center gap-3" href="/">
							<img
								alt="JustAJobApp Logo"
								className="h-9 w-9 object-contain"
								src={
									theme === "dark"
										? "/justajobapp-square-dark-monogram-logo-favicon.png"
										: "/justajobapp-circle-monogram-logo-social.png"
								}
							/>
							<span className="text-xl font-semibold text-gray-900 dark:text-white">
								{siteConfig.name}
							</span>
						</NextLink>
					</div>

					{/* Center/Right navigation links and actions */}
					<div className="hidden md:flex items-center space-x-2">
						{/* About dropdown */}
						<div className="relative group">
							<button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors flex items-center gap-1">
								About
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										d="M19 9l-7 7-7-7"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
									/>
								</svg>
							</button>
							<div className="absolute left-0 mt-0 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-200 dark:border-gray-700">
								<div className="py-1">
									<NextLink
										className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
										href="/"
									>
										Job Seekers
									</NextLink>
									<NextLink
										className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
										href="/coaches"
									>
										Career Coaches
									</NextLink>
									<NextLink
										className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
										href="/faq"
									>
										FAQ
									</NextLink>
								</div>
							</div>
						</div>

						{/* Contribute dropdown */}
						<div className="relative group">
							<button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors flex items-center gap-1">
								Contribute
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										d="M19 9l-7 7-7-7"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
									/>
								</svg>
							</button>
							<div className="absolute left-0 mt-0 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-200 dark:border-gray-700">
								<div className="py-1">
									<button
										className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
										onClick={handleDonateClick}
									>
										Donate
									</button>
									<NextLink
										className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
										href="/contributors"
									>
										Participate
									</NextLink>
								</div>
							</div>
						</div>

						{/* Dashboard dropdown - shown when authenticated and not on dashboard */}
						{isAuthenticated && pathname !== "/dashboard" && (
							<div className="relative group">
								<button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors flex items-center gap-1">
									Dashboard
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											d="M19 9l-7 7-7-7"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
										/>
									</svg>
								</button>
								<div className="absolute left-0 mt-0 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-200 dark:border-gray-700">
									<div className="py-1">
										<NextLink
											className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
											href="/dashboard"
										>
											View
										</NextLink>
										<NextLink
											className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
											href="/logout"
										>
											Logout
										</NextLink>
									</div>
								</div>
							</div>
						)}

						{/* Primary CTA button (Dashboard or Login) - only show when not authenticated or on dashboard */}
						{(!isAuthenticated || pathname === "/dashboard") && (
							<NextLink
								className="ml-4 inline-flex items-center px-5 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
								href={primaryCTA.href}
							>
								{primaryCTA.label}
							</NextLink>
						)}

						{/* Heart donate button - always visible */}
						<button
							className="ml-6 p-2.5 border border-gray-300 dark:border-gray-600 rounded-md text-gray-500 hover:text-gray-700 hover:border-gray-400 dark:text-gray-400 dark:hover:text-white dark:hover:border-gray-500 transition-colors"
							title="Donate"
							onClick={handleDonateClick}
						>
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
								<path
									clipRule="evenodd"
									d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
									fillRule="evenodd"
								/>
							</svg>
						</button>
					</div>

					{/* Mobile menu button */}
					<div className="-mr-2 flex md:hidden">
						<button
							aria-controls="mobile-menu"
							aria-expanded="false"
							className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
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

			{/* Mobile menu */}
			{isOpen && (
				<div
					className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800"
					id="mobile-menu"
				>
					<div className="px-2 pt-2 pb-3 space-y-1">
						{/* About section */}
						<div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
							About
						</div>
						<NextLink
							className="block px-3 py-2 pl-6 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
							href="/"
							onClick={() => setIsOpen(false)}
						>
							Job Seekers
						</NextLink>
						<NextLink
							className="block px-3 py-2 pl-6 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
							href="/coaches"
							onClick={() => setIsOpen(false)}
						>
							Career Coaches
						</NextLink>
						<NextLink
							className="block px-3 py-2 pl-6 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
							href="/faq"
							onClick={() => setIsOpen(false)}
						>
							FAQ
						</NextLink>

						{/* Contribute section */}
						<div className="px-3 py-2 pt-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-t border-gray-200 dark:border-gray-800">
							Contribute
						</div>
						<button
							className="block w-full text-left px-3 py-2 pl-6 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
							onClick={() => {
								setIsOpen(false);
								handleDonateClick();
							}}
						>
							Donate
						</button>
						<NextLink
							className="block px-3 py-2 pl-6 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
							href="/contributors"
							onClick={() => setIsOpen(false)}
						>
							Participate
						</NextLink>

						{/* Auth section */}
						<div className="pt-4 border-t border-gray-200 dark:border-gray-800">
							<NextLink
								className="block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
								href={primaryCTA.href}
								onClick={() => setIsOpen(false)}
							>
								{primaryCTA.label}
							</NextLink>
							{isAuthenticated && pathname !== "/dashboard" && (
								<NextLink
									className="block px-3 py-2 mt-1 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
									href="/logout"
									onClick={() => setIsOpen(false)}
								>
									Log out
								</NextLink>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Payment modal - only rendered when not using external handler */}
			{!onDonateClick && (
				<PaymentAsk
					isOpen={showPaymentModal}
					triggerType="navbar_donate"
					onClose={() => setShowPaymentModal(false)}
				/>
			)}
		</nav>
	);
};
