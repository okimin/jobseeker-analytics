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
		github: "https://github.com/just-a-job-app/jobseeker-analytics",
		discord: "https://discord.gg/gsdpMchCam",
		sponsor: "https://github.com/sponsors/lnovitz",
		privacyPolicy: "/privacy",
		termsAndConditions: "/terms",
		cookiePolicy: "/cookies",
		dataRequests: "/dsar",
		community: "/contributors",
		coffee: "https://buymeacoffee.com/justajobapp",
		feedback: "https://forms.gle/aGeT11NYJpcSBEix8",
		support: "mailto:help@justajobapp.com",
		waitlist: "/pricing"
	}
};
