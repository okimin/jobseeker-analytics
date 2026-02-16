import "@/styles/globals.css";
import { headers } from "next/headers";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
import { Inter } from "next/font/google";
import Script from "next/script";

import { Providers, PostHogProvider } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	metadataBase: new URL("https://www.justajobapp.com"), // Base URL for all metadata
	title: {
		default: siteConfig.name,
		template: `%s - ${siteConfig.name}`
	},
	description: siteConfig.description,
	alternates: {
		canonical: "/" // This sets <link rel="canonical" href="https://www.justajobapp.com/" />
	},
	icons: {
		icon: "/favicon.ico"
	}
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "white" },
		{ media: "(prefers-color-scheme: dark)", color: "black" }
	]
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const isProd = process.env.NODE_ENV === "production";
	const nonce = (await headers()).get("x-nonce") || undefined;

	return (
		<html suppressHydrationWarning lang="en">
			<body
				className={clsx("min-h-screen bg-background font-sans antialiased", fontSans.variable, inter.className)}
			>
				<PostHogProvider>
					<Providers themeProps={{ nonce: nonce, attribute: "class", defaultTheme: "dark" }}>
						<div className="relative flex h-screen flex-col">
							<main className="container mx-auto flex-grow max-w-7xl px-6 pt-16">{children}</main>
							<Footer />
						</div>
					</Providers>
				</PostHogProvider>
				{isProd && (
					<Script
						integrity="sha384-mbLNRmLXKn0EeOWA8CkkcQulVLq0F93UcuDlZqBW+iCJ8Sre41d9PE1SB/9MXadG"
						nonce={nonce}
						src="https://app.termly.io/resource-blocker/6adf3d96-4f08-4972-b58b-0e62e4e81785?autoBlock=on"
						strategy="afterInteractive"
					/>
				)}
			</body>
		</html>
	);
}
