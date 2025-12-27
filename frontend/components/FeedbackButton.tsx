"use client";

import { Button } from "@heroui/react";
import Image from "next/image";

export default function FeedbackButton() {
	return (
		<a
			aria-label="Feedback"
			className="fixed bottom-4 right-4 z-50"
			href="https://forms.gle/aGeT11NYJpcSBEix8"
			rel="noopener noreferrer"
			target="_blank"
		>
			<Button isIconOnly aria-label="Feedback" className="shadow-lg hover:shadow-xl transition-shadow">
				<Image alt="Feedback" height={100} src="/chatbubble-monogram-logo.png" width={100} />
			</Button>
		</a>
	);
}
