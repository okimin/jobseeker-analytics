// frontend/proxy.ts
import { NextResponse, NextRequest } from "next/server";

export function proxy(request: NextRequest) {
	// 1. Generate a unique nonce for every request
	const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
	// Check if we are in development mode
	const isDev = process.env.NODE_ENV === "development";
	// 2. Define your Strict CSP
	// - Added 'strict-dynamic' to allow Termly to load its own sub-scripts
	// - Whitelisted Termly domains: app.termly.io and *.api.termly.io
	const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${isDev ? "'unsafe-eval'" : ""} https://apis.google.com https://accounts.google.com https://*.posthog.com;
    child-src 'self' blob:;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://*.posthog.com https://app.termly.io https://*.googleusercontent.com;
    worker-src 'self' blob:;
    connect-src 'self' http://localhost:8000 https://*.posthog.com https://us.i.posthog.com https://us-assets.i.posthog.com api.justajobapp.com https://app.termly.io https://*.api.termly.io ${isDev ? "ws: wss:" : ""};
    frame-src 'self' https://app.termly.io https://www.youtube.com blob:;
    font-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
		.replace(/\s{2,}/g, " ")
		.trim();

	// 3. Set headers for both the request (to read in Layout) and response (for browser enforcement)
	const requestHeaders = new Headers(request.headers);
	requestHeaders.set("x-nonce", nonce);
	requestHeaders.set("Content-Security-Policy", cspHeader);

	const response = NextResponse.next({
		headers: requestHeaders,
		request: {
			headers: requestHeaders
		}
	});

	response.headers.set("Content-Security-Policy", cspHeader);
	return response;
}

// 4. Configure Matcher to exclude static assets (optimization)
export const config = {
	matcher: [
		{
			source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
			missing: [
				{ type: "header", key: "next-router-prefetch" },
				{ type: "header", key: "purpose", value: "prefetch" }
			]
		}
	]
};
