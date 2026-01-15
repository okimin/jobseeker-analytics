"use client";
import { FAQ } from "@/components/FAQ";
import { Navbar } from "@/components/navbar";
export default function FAQPage() {
	return (
		<div className="flex flex-col min-h-screen">
			<Navbar />
			<FAQ />
		</div>
	);
}
