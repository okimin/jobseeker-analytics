export type SiteConfig = typeof siteConfig;

export const siteConfig = {
	name: "JustAJobApp",
	description: "Stop Giving a Click.",
	navItems: [
		{
			label: "Job Seekers",
			href: "/",
		},
		{
			label: "Coaches",
			href: "/coaches",
		},
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
		sponsor: "https://github.com/sponsors/lnovitz"
	}
};
