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

		const cspHeader =
			"default-src 'self'; " +
			"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.termly.io https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/; " +
			"style-src 'self' 'unsafe-inline'; " +
			"img-src 'self' data: https:; " +
			"font-src 'self'; " +
			"connect-src 'self' https://app.termly.io; " +
			"frame-src https://www.google.com/recaptcha/; " +
			"frame-ancestors 'none'; " +
			"form-action 'self';";

		const securityHeaders = [
			{ key: "X-Frame-Options", value: "DENY" },
			{ key: "Content-Security-Policy", value: cspHeader },
			{ key: "X-Content-Type-Options", value: "nosniff" },
			{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
			{ key: "Permissions-Policy", value: permissionsPolicy },
			{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" } // TODO: add preload later
		];

		return [
			{
				// 1. GLOBAL FALLBACK (Must be FIRST)
				// Default to Private/No-Cache for safety.
				// Matches everything, but will be overridden by specific rules below.
				source: "/:path*",
				headers: [
					...securityHeaders,
					{
						key: "Cache-Control",
						value: "private, no-cache, max-age=0, s-maxage=0, must-revalidate"
					}
				]
			},
			{
				// 2. Public Pages - Allow Caching (Overrides Block 1)
				// These pages are static and safe to cache for 1 hour.
				source: "/(login|coaches|faq|privacy|terms|contributors)?",
				// Note: The regex above catches specific routes. Excludes api/
				// The root "/" requires its own specific object usually, see below.
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
