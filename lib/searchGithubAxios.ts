import axios from "axios";
import type {
  SearchResponse,
  Repository,
  CodeSearchItem,
  CommitSearchItem,
  User,
} from "../types/github";

// Generic search function - now calls internal API route using axios
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
    const params = {
      endpoint,
      q: query,
      order,
      page: page.toString(),
      per_page: per_page.toString(),
      ...(sort && { sort }),
    };

    const response = await axios.get("/api/search", {
      params,
    });

    return response.data;
  } catch (error: unknown) {
    // Handle axios errors
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        console.error(
          "GitHub API rate limit error. Please add GitHub Personal Access Token:",
        );
        throw new Error(
          "GitHub API rate limit. Please add Personal Access Token.",
        );
      }

      const errorMessage =
        error.response?.data?.error || `API error: ${error.response?.status}`;
      throw new Error(errorMessage);
    }

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
