"use client";

interface ContributorBadgeProps {
	monthlyCents: number;
}

export default function ContributorBadge({ monthlyCents }: ContributorBadgeProps) {
	if (monthlyCents === 0) return null;

	const dollarAmount = monthlyCents / 100;

	return (
		<div className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-sm">
			<span aria-label="heart">💙</span>
			<span>${dollarAmount}/mo</span>
		</div>
	);
}
