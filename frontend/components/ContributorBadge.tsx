"use client";

interface ContributorBadgeProps {
	monthlyCents: number;
	onClick?: () => void;
}

export default function ContributorBadge({ monthlyCents, onClick }: ContributorBadgeProps) {
	if (monthlyCents === 0) return null;

	const dollarAmount = monthlyCents / 100;

	return (
		<button
			className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors cursor-pointer"
			type="button"
			onClick={onClick}
		>
			<span aria-label="heart">💙</span>
			<span>${dollarAmount}/mo</span>
			<svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
				/>
			</svg>
		</button>
	);
}
