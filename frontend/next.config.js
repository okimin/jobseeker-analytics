/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	// Disable X-Powered-By header to prevent technology fingerprinting
	poweredByHeader: false,
	experimental: {},

	async rewrites() {
		return [
			{
				source: "/ingest/static/:path*",
				destination: "https://us-assets.i.posthog.com/static/:path*"
			},
			{
				source: "/ingest/:path*",
				destination: "https://us.i.posthog.com/:path*"
			}
		];
	},

	skipTrailingSlashRedirect: true,

	async headers() {
		const permissionsPolicy = "camera=(), microphone=(), geolocation=(), browsing-topics=()";

		const securityHeaders = [
			{ key: "X-Frame-Options", value: "DENY" },
			{ key: "X-Content-Type-Options", value: "nosniff" },
			{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
			{ key: "Permissions-Policy", value: permissionsPolicy },
			{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" } // TODO: add preload later
		];

		return [
			{
				// 1. GLOBAL FALLBACK (Must be FIRST)
				// Default to strictly NO-STORE for all dynamic/authenticated content.
				source: "/:path*",
				headers: [
					...securityHeaders,
					{
						key: "Cache-Control",
						value: "no-store, no-cache, must-revalidate, proxy-revalidate"
					},
					{ key: "Pragma", value: "no-cache" },
					{ key: "Expires", value: "0" }
				]
			},
			{
				// 2. Public Static Pages - Allow Caching (Overrides Block 1)
				// Explicitly allowlist non-sensitive pages.
				source: "/:path(login|coaches|faq|pricing|privacy|terms|contributors|cookies|dsar|signup)",
				headers: [
					...securityHeaders,
					{
						key: "Cache-Control",
						value: "public, max-age=3600, must-revalidate"
					}
				]
			},
			{
				// 2b. Explicitly catch the Root Homepage "/"
				source: "/",
				headers: [
					...securityHeaders,
					{
						key: "Cache-Control",
						value: "public, max-age=3600, must-revalidate"
					}
				]
			},
			{
				// 3. Next.js Build Assets - Immutable
				source: "/_next/static/:path*",
				headers: [
					...securityHeaders,
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable"
					}
				]
			},
			{
				// 4. Public Assets (Images, etc) - Immutable
				source: "/:path(.+\\.(?:ico|png|svg|jpg|jpeg|gif|webp)$)",
				headers: [
					...securityHeaders,
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable"
					}
				]
			}
		];
	}
};

module.exports = nextConfig;
