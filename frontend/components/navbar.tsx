"use client";

import { Navbar as HeroUINavbar, NavbarContent, NavbarBrand, NavbarItem, Button } from "@heroui/react";
import NextLink from "next/link";

export const Navbar = () => {
	return (
		<HeroUINavbar
			isBordered
			className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
			maxWidth="xl"
		>
			<NavbarContent className="basis-1/5 sm:basis-full" justify="start">
				<NavbarBrand as="li" className="gap-3 max-w-fit">
					<NextLink className="flex justify-start items-center gap-1" href="/">
						<div className="flex items-center gap-3">
							<img alt="Shining Nuggets Logo" className="h-12 w-12 object-contain" src="/logo.png" />
							<div className="flex flex-col">
								<span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-emerald-600">
									Just A Job App
								</span>
								<span className="text-xs text-default-500 -mt-1">
									Get the System Behind a 3x Interview Rate.
								</span>
							</div>
						</div>
					</NextLink>
				</NavbarBrand>
			</NavbarContent>

			<NavbarContent className="hidden md:flex basis-1/5 sm:basis-full" justify="end">
				<NavbarItem>
					<Button
						as="a"
						className="bg-amber-600 text-white hover:bg-amber-700"
						href="#waitlist"
						variant="solid"
						onPress={() => {
							// Add fireworks animation to waitlist section
							const waitlistSection = document.getElementById("waitlist");
							if (waitlistSection) {
								// Import the function dynamically to avoid circular dependencies
								import("@/components/Footer").then((module) => {
									const { createFireworkEffect } = module;
									waitlistSection.classList.add("golden-sparkle-border");
									createFireworkEffect(waitlistSection);
									setTimeout(() => {
										waitlistSection.classList.remove("golden-sparkle-border");
									}, 2000);
								});
							}
						}}
					>
						Request Early Access
					</Button>
				</NavbarItem>
			</NavbarContent>

			{/* Smaller screens */}
			<NavbarContent className="md:hidden" justify="end">
				<Button
					as="a"
					className="bg-amber-600 text-white hover:bg-amber-700"
					href="#waitlist"
					size="sm"
					variant="solid"
					onPress={() => {
						// Add fireworks animation to waitlist section
						const waitlistSection = document.getElementById("waitlist");
						if (waitlistSection) {
							// Import the function dynamically to avoid circular dependencies
							import("@/components/Footer").then((module) => {
								const { createFireworkEffect } = module;
								waitlistSection.classList.add("golden-sparkle-border");
								createFireworkEffect(waitlistSection);
								setTimeout(() => {
									waitlistSection.classList.remove("golden-sparkle-border");
								}, 2000);
							});
						}
					}}
				>
					Request Your Invite
				</Button>
			</NavbarContent>
		</HeroUINavbar>
	);
};
