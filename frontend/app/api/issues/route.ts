import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";

export async function POST(request: Request) {
	try {
		const { title, description } = await request.json();

		if (!title || !description) {
			return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
		}

		let appOctokit: Octokit | null = null;

		if (process.env.GH_APP_ID && process.env.GH_PRIVATE_KEY && process.env.GH_INSTALLATION_ID) {
			try {
				appOctokit = new Octokit({
					authStrategy: createAppAuth,
					auth: {
						appId: process.env.GH_APP_ID,
						privateKey: process.env.GH_PRIVATE_KEY,
						installationId: process.env.GH_INSTALLATION_ID
					}
				});
			} catch (error) {
				console.warn("Failed to initialize GitHub App authentication:", error);
				return NextResponse.json({ error: "Failed to submit issue" }, { status: 500 });
			}

			const response = await appOctokit.issues.create({
				owner: "just-a-job-app",
				repo: "jobseeker-analytics",
				title: `[BUG]: ${title}`,
				body: description,
				labels: ["📣 user feedback"]
			});

			return NextResponse.json({ success: true, issueNumber: response.data.number }, { status: 201 });
		}
	} catch (error) {
		console.error("Error creating issue:", error);
		return NextResponse.json({ error: "Failed to submit issue" }, { status: 500 });
	}
}
