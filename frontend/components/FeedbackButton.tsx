"use client";

import { Button } from "@heroui/react";
import Image from "next/image";

export default function FeedbackButton() {
	return (
		<a
			href="https://forms.gle/aGeT11NYJpcSBEix8"
			target="_blank"
			rel="noopener noreferrer"
			className="fixed bottom-4 right-4 z-50"
			aria-label="Feedback"
		>
			<Button isIconOnly aria-label="Feedback" className="shadow-lg hover:shadow-xl transition-shadow">
				<Image alt="Feedback" height={100} src="/feedback-icon.png" width={100} />
			</Button>
		</a>
	);
}
