import type { NextRequest } from "next/server";

const BASE_URL = "https://api.github.com/search";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint") || "repositories";
    const q = searchParams.get("q") || "";
    const sort = searchParams.get("sort");
    const order = searchParams.get("order") || "desc";
    const page = searchParams.get("page") || "1";
    const per_page = searchParams.get("per_page") || "10";

    // Build query parameters
    const params = new URLSearchParams({
      q,
      order,
      page,
      per_page,
    });

    if (sort) {
      params.append("sort", sort);
    }

    // Build headers
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    // Add GitHub token if available (private environment variable)
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(
      `${BASE_URL}/${endpoint}?${params.toString()}`,
      {
        headers,
      },
    );

    if (!response.ok) {
      if (response.status === 403) {
        const hasToken = !!process.env.GITHUB_TOKEN;
        return Response.json(
          {
            error: hasToken
              ? "GitHub API rate limit exceeded. Please try again later."
              : "GitHub API rate limit exceeded. Please add GITHUB_TOKEN to .env.local",
            status: 403,
            hasToken,
          },
          { status: 403 },
        );
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error: unknown) {
    console.error("API route error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
