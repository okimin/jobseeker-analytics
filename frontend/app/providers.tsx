"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ToastProvider } from "@heroui/toast";
import { useEffect, Suspense } from "react";
// PostHog Imports
import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";

// 1. Move the GPC logic here
const hasGPCSignal = () => {
	if (typeof navigator !== "undefined" && "globalPrivacyControl" in navigator) {
		return (navigator as Navigator & { globalPrivacyControl: boolean }).globalPrivacyControl === true;
	}
	return false;
};

// 2. Initialize exactly once when the window loads
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
	posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
		api_host: "/ingest",
		ui_host: "https://us.posthog.com",
		defaults: "2026-01-30",
		opt_out_capturing_by_default: hasGPCSignal(),
		debug: process.env.NODE_ENV === "development",
		session_recording: { maskTextSelector: "*" },
		opt_in_site_apps: true
	});
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
	const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

	if (!posthogKey) {
		return <>{children}</>;
	}

	return (
		<PHProvider client={posthog}>
			<SuspendedPostHogPageView />
			{children}
		</PHProvider>
	);
}

function PostHogPageView() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const posthog = usePostHog();

	// Track pageviews
	useEffect(() => {
		if (pathname && posthog) {
			let url = window.origin + pathname;
			if (searchParams.toString()) {
				url = url + "?" + searchParams.toString();
			}

			posthog.capture("$pageview", { $current_url: url });
		}
	}, [pathname, searchParams, posthog]);

	return null;
}

// Wrap PostHogPageView in Suspense to avoid the useSearchParams usage above
// from de-opting the whole app into client-side rendering
// See: https://nextjs.org/docs/messages/deopted-into-client-rendering
function SuspendedPostHogPageView() {
	return (
		<Suspense fallback={null}>
			<PostHogPageView />
		</Suspense>
	);
}

export interface ProvidersProps {
	children: React.ReactNode;
	themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
	interface RouterConfig {
		routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>["push"]>[1]>;
	}
}

export function Providers({ children, themeProps }: ProvidersProps) {
	const router = useRouter();

	return (
		<NextThemesProvider {...themeProps}>
			<HeroUIProvider navigate={router.push}>
				<ToastProvider
					placement="top-center"
					toastProps={{
						timeout: 2000
					}}
				/>
				{children}
			</HeroUIProvider>
		</NextThemesProvider>
	);
}
