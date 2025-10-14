"use client";

import { usePathname } from "next/navigation";

import FeedbackButton from "@/components/FeedbackButton";

export default function ConditionalFeedbackButton() {
	const pathname = usePathname();

	// Don't show feedback button on the landing page (/)
	if (pathname === "/") {
		return null;
	}

	return <FeedbackButton />;
}
