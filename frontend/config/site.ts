export type SiteConfig = typeof siteConfig;

export const siteConfig = {
	name: "Just A Job App",
	description: "Get the Unfair Advantage in Your Job Search.",
	navItems: [
		{
			label: "Home",
			href: "/"
		},
		{
			label: "Dashboard",
			href: "/dashboard"
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
		sponsor: "https://github.com/sponsors/lnovitz"
	}
};
