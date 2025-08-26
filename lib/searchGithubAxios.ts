import type {
  SearchResponse,
  Repository,
  CodeSearchItem,
  Issue,
  CommitSearchItem,
  User,
} from "../types/github";

// Generic search function - now calls internal API route
export async function searchGithub<T>(
  endpoint: string,
  query: string,
  sort?: string,
  order: "asc" | "desc" = "desc",
  per_page: number = 5,
  page: number = 1,
): Promise<SearchResponse<T>> {
  try {
    // Build query parameters for internal API
    const searchParams = new URLSearchParams({
      endpoint,
      q: query,
      order,
      page: page.toString(),
      per_page: per_page.toString(),
    });

    if (sort) {
      searchParams.append("sort", sort);
    }

    const response = await fetch(`/api/search?${searchParams.toString()}`);

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 403) {
        console.error(
          "GitHub API rate limit error. Please add GitHub Personal Access Token:",
        );
        console.error("1. Visit https://github.com/settings/tokens");
        console.error(
          "2. Generate new token (only need public_repo permission)",
        );
        console.error("3. Create .env.local file in project root");
        console.error("4. Add: GITHUB_TOKEN=your_token_here");

        throw new Error(
          "GitHub API rate limit. Please add Personal Access Token.",
        );
      }
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error: unknown) {
    console.error("Search error:", error);
    throw error;
  }
}

// Search repositories
export async function searchRepositories(
  searchText: string = "",
  sort: "stars" | "forks" | "help-wanted-issues" | "updated" = "stars",
  order: "asc" | "desc" = "desc",
  per_page: number = 10,
  page: number = 1,
): Promise<SearchResponse<Repository>> {
  const query = searchText.trim();
  const data = await searchGithub<Repository>(
    "repositories",
    query,
    sort,
    order,
    per_page,
    page,
  );
  data.items.forEach((repo: Repository, i: number) => {
    console.log(`${i + 1}. ${repo.full_name} ⭐ ${repo.stargazers_count}`);
  });
  return data;
}

// Search code inside a repository
export async function searchCode(
  query: string = "addEventListener in:file language:typescript repo:vercel/next.js",
  order: "asc" | "desc" = "desc",
  per_page: number = 5,
  page: number = 1,
): Promise<SearchResponse<CodeSearchItem>> {
  const data = await searchGithub<CodeSearchItem>(
    "code",
    query,
    undefined,
    order,
    per_page,
    page,
  );
  data.items.forEach((file: CodeSearchItem, i: number) => {
    console.log(`${i + 1}. ${file.name} @ ${file.repository.full_name}`);
  });
  return data;
}

// Search issues
export async function searchIssues(
  query: string = "is:open is:issue bug repo:facebook/react",
  sort:
    | "comments"
    | "reactions"
    | "reactions-+1"
    | "reactions--1"
    | "reactions-smile"
    | "reactions-thinking_face"
    | "reactions-heart"
    | "reactions-tada"
    | "interactions"
    | "created"
    | "updated" = "created",
  order: "asc" | "desc" = "desc",
  per_page: number = 5,
  page: number = 1,
): Promise<SearchResponse<Issue>> {
  const data = await searchGithub<Issue>(
    "issues",
    query,
    sort,
    order,
    per_page,
    page,
  );
  data.items.forEach((issue: Issue) => {
    console.log(`#${issue.number}: ${issue.title}`);
  });
  return data;
}

// Search commits
export async function searchCommits(
  query: string = "fix repo:facebook/react",
  sort: "author-date" | "committer-date" = "author-date",
  order: "asc" | "desc" = "desc",
  per_page: number = 5,
  page: number = 1,
): Promise<SearchResponse<CommitSearchItem>> {
  const data = await searchGithub<CommitSearchItem>(
    "commits",
    query,
    sort,
    order,
    per_page,
    page,
  );
  data.items.forEach((commit: CommitSearchItem) => {
    console.log(`${commit.sha.substring(0, 7)}: ${commit.commit.message}`);
  });
  return data;
}

// Search users
export async function searchUsers(
  query: string = "tom repos:>40 followers:>1000",
  sort: "followers" | "repositories" | "joined" = "followers",
  order: "asc" | "desc" = "desc",
  per_page: number = 5,
  page: number = 1,
): Promise<SearchResponse<User>> {
  const data = await searchGithub<User>(
    "users",
    query,
    sort,
    order,
    per_page,
    page,
  );
  data.items.forEach((user: User, i: number) => {
    console.log(`${i + 1}. ${user.login} (${user.html_url})`);
  });
  return data;
}
