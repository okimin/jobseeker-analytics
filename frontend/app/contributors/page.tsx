"use client";

import React from "react";
import { Card, CardBody, Avatar } from "@heroui/react";

import contributorsData from "../../data/contributors.json";

interface Contributor {
	name: string;
	github: string;
	avatar: string;
	message: string;
	date: string;
}

export default function ContributorsPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
			<div className="container mx-auto px-4 py-12">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-white mb-4">
						Wall of Fame 🏆
					</h1>
					<p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
						Meet the amazing contributors who have helped build Just A Job App (JAJA). Each person here has
						left their mark on this project!
					</p>
				</div>

				{/* Contributors Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
					{contributorsData.map((contributor: Contributor, index: number) => (
						<Card
							key={contributor.github}
							isPressable
							className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
							onPress={() => window.open(`https://github.com/${contributor.github}`, "_blank")}
						>
							<CardBody className="text-center p-6">
								{/* Avatar */}
								<div className="flex justify-center mb-4">
									<Avatar
										showFallback
										className="w-24 h-24 text-large"
										name={contributor.name}
										size="lg"
										src={contributor.avatar}
									/>
								</div>

								{/* Name */}
								<h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
									{contributor.name}
								</h3>

								{/* GitHub Username */}
								<p className="text-sm text-gray-500 dark:text-gray-400 mb-3">@{contributor.github}</p>

								{/* Message */}
								<div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
									<p className="text-gray-700 dark:text-gray-300 italic">"{contributor.message}"</p>
								</div>

								{/* Date */}
								<p className="text-xs text-gray-400 dark:text-gray-500">
									Joined{" "}
									{new Date(contributor.date).toLocaleDateString("en-US", {
										year: "numeric",
										month: "long",
										day: "numeric"
									})}
								</p>
							</CardBody>
						</Card>
					))}
				</div>

				{/* Call to Action */}
				<div className="text-center mt-16">
					<div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
						<h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
							Want to join the Wall of Fame? 🚀
						</h2>
						<p className="text-gray-600 dark:text-gray-300 mb-6">
							Make your first contribution and get your profile added to our Wall of Fame! Check out our
							contributor onboarding guide to get started.
						</p>
						<div className="flex flex-col sm:flex-col gap-4 justify-center">
							<a
								className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
								href="https://github.com/just-a-job-app/jobseeker-analytics/blob/main/CONTRIBUTOR_ONBOARDING.md"
								rel="noopener noreferrer"
								target="_blank"
							>
								View on GitHub
							</a>
							<a
								className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
								href="https://github.com/just-a-job-app/jobseeker-analytics/blob/main/CONTRIBUTOR_ONBOARDING.md#step-3-add-yourself-to-the-wall-of-fame"
								rel="noopener noreferrer"
								target="_blank"
							>
								Are you in the guided install workshop? Click here!
							</a>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="text-center mt-12">
					<p className="text-gray-500 dark:text-gray-400">Made with ❤️ by the JAJA community</p>
				</div>
			</div>
		</div>
	);
}
