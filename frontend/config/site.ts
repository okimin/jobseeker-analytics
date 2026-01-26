export type SiteConfig = typeof siteConfig;

export const siteConfig = {
	name: "JustAJobApp",
	legalName: "JustAJobApp LLC",
	description: "Stop Giving a Click.",
	navItems: [
		{
			label: "Job Seekers",
			href: "/"
		},
		{
			label: "Career Coaches",
			href: "/coaches"
		},
		{
			label: "FAQ",
			href: "/faq"
		}
	],
	navMenuItems: [
		{
			label: "Dashboard",
			href: "/dashboard"
		},
		{
			label: "Logout",
			href: "/logout"
		},
		{
			label: "Login",
			href: "/login"
		}
	],
	links: {
		// Internal routes
		home: "/",
		coaches: "/coaches",
		faq: "/faq",
		dashboard: "/dashboard",
		login: "/login",
		logout: "/logout",
		privacyPolicy: "/privacy",
		termsAndConditions: "/terms",
		cookiePolicy: "/cookies",
		dataRequests: "/dsar",
		wallOfFame: "/contributors",
		// External links
		github: "https://github.com/JustAJobApp/jobseeker-analytics",
		githubIssues:
			"https://github.com/JustAJobApp/jobseeker-analytics/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22help%20wanted%22%20no%3Aassignee",
		contributorOnboarding: "https://github.com/JustAJobApp/jobseeker-analytics/blob/main/CONTRIBUTOR_ONBOARDING.md",
		contributorOnboardingStep3:
			"https://github.com/just-a-job-app/jobseeker-analytics/blob/main/CONTRIBUTOR_ONBOARDING.md#step-3-add-yourself-to-the-wall-of-fame",
		emailFilterYaml:
			"https://github.com/JustAJobApp/jobseeker-analytics/blob/main/backend/email_query_filters/applied_email_filter.yaml",
		llmUtils: "https://github.com/JustAJobApp/jobseeker-analytics/blob/main/backend/utils/llm_utils.py",
		coachPortal: "https://coach.justajobapp.com/?utm_source=homepage&utm_campaign=coaches_2",
		dsarForm: "https://app.termly.io/dsar/a8dc31e4-d96a-461e-afe0-abdec759bc97",
		googleApiPolicy: "https://developers.google.com/terms/api-services-user-data-policy",
		donate: "https://donate.stripe.com/fZu28r8Q98jSeGD8lFdIA00",
		feedback: "https://forms.gle/2askT8RbMvh1pFJk6",
		support: "mailto:help@justajobapp.com",
		hiringCafe: "https://hiring.cafe/",
		neverSearchAlone: "https://www.neversearchalone.com/",
		waitlist: "https://its.justajobapp.com/",
		homepage: "https://justajobapp.com"
	}
};
