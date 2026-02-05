"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Navbar } from "@/components/navbar";
import SettingsModal from "@/components/SettingsModal";

export default function SettingsPage() {
	const router = useRouter();
	const [isModalOpen, setIsModalOpen] = useState(true);

	const handleClose = () => {
		setIsModalOpen(false);
		router.push("/dashboard");
	};

	return (
		<div className="flex flex-col min-h-screen">
			<Navbar />
			<main className="flex-grow bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
				<SettingsModal isOpen={isModalOpen} onClose={handleClose} />
			</main>
		</div>
	);
}
