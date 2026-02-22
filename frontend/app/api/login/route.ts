import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
	// Redirect to backend login endpoint
	const searchParams = request.nextUrl.searchParams;

	const stepUp = searchParams.get("step_up");
	const returnTo = searchParams.get("return_to");
	let url = `${apiUrl}/auth/google`;
	const params = new URLSearchParams();

	if (stepUp === "true") {
		params.append("step_up", "true");
	}
	if (returnTo) {
		params.append("return_to", returnTo);
	}

	if (params.toString()) {
		url += `?${params.toString()}`;
	}
	return NextResponse.redirect(url);
}
