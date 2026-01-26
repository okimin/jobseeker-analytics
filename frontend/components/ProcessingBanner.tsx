"use client";

import { Progress } from "@heroui/react";
import { CogIcon } from "@heroicons/react/20/solid";

interface ProcessingBannerProps {
	processed: number;
	total: number;
	found: number;
}

export default function ProcessingBanner({ processed, total, found }: ProcessingBannerProps) {
	const percent = total > 0 ? Math.round((processed / total) * 100) : 0;

	return (
		<div className="bg-blue-50 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800 px-4 py-3 mb-4 rounded-lg">
			<div className="max-w-4xl mx-auto">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<CogIcon className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
						<span className="text-blue-900 dark:text-blue-100">
							Scanning your inbox... {processed}/{total} emails
						</span>
					</div>
					<span className="text-blue-600 dark:text-blue-400 font-medium">
						{found} job search emails {found !== 1 ? "s" : ""} found
					</span>
				</div>
				<Progress
					aria-label="Email processing progress"
					className="mt-2"
					color="primary"
					size="sm"
					value={percent}
				/>
			</div>
		</div>
	);
}
