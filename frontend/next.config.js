/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	// Disable X-Powered-By header to prevent technology fingerprinting
	poweredByHeader: false,
	// Ensure experimental features are removed
	experimental: {
		// Remove any experimental features
	},

	// Add PostHog rewrites
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

	// Required to support PostHog trailing slash API requests
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
			{
				key: "X-Frame-Options",
				value: "DENY"
			},
			{
				key: "Content-Security-Policy",
				value: cspHeader
			},
			{
				key: "X-Content-Type-Options",
				value: "nosniff"
			},
			{
				key: "Referrer-Policy",
				value: "strict-origin-when-cross-origin"
			},
			{
				key: "Permissions-Policy",
				value: permissionsPolicy
			}
		];

		return [
			{
				// 1. Next.js Build Assets (hashed files) - IMMUTABLE
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
				// 2. Specific folders in your public directory - IMMUTABLE
				// Matches /homepage/... and /contributors/...
				source: "/(homepage|contributors)/:path*",
				headers: [
					...securityHeaders,
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable"
					}
				]
			},
			{
				// 3. Common image extensions (root level or nested) - IMMUTABLE
				// Catches favicon.ico, logo.png, sankey_diagram.png etc.
				source: "/:path(.+\\.(?:ico|png|svg|jpg|jpeg|gif|webp)$)",
				headers: [
					...securityHeaders,
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable"
					}
				]
			},
			{
				// 4. Fallback for HTML pages and API routes - NO CACHE
				// Ensures users always get the latest version of your app logic
				source: "/:path*",
				headers: [
					...securityHeaders,
					{
						key: "Cache-Control",
						value: "private, no-cache, no-store, max-age=0, s-maxage=0, must-revalidate"
					}
				]
			}
		];
	}
};

module.exports = nextConfig;