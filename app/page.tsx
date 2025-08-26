"use client";

import { ResultTable } from "@/components/search-result-table";
import { ModeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useDebounce } from "@/hooks/useDebounce";
import { searchGithub } from "@/lib/searchGithubAxios";
import type {
  Repository,
  CodeSearchItem,
  CommitSearchItem,
  User,
  SearchResponse,
} from "@/types/github";
import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function Home() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [selected, setSelected] = useState("repositories");
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<SearchResponse<
    Repository | CodeSearchItem | CommitSearchItem | User
  > | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const performSearch = useCallback(
    async (query: string, page: number = 1) => {
      if (!query.trim()) {
        setSearchResults(null);
        setError(null);
        return;
      }

      setIsSearching(true);
      setError(null);
      try {
        let data: SearchResponse<
          Repository | CodeSearchItem | CommitSearchItem | User
        >;

        switch (selected) {
          case "repositories":
            data = await searchGithub<Repository>(
              "repositories",
              query,
              "stars",
              "desc",
              10,
              page
            );
            break;

          case "code":
            data = await searchGithub<CodeSearchItem>(
              "code",
              query,
              undefined,
              "desc",
              10,
              page
            );
            break;
          case "commits":
            data = await searchGithub<CommitSearchItem>(
              "commits",
              query,
              "author-date",
              "desc",
              10,
              page
            );
            break;
          case "users":
            data = await searchGithub<User>(
              "users",
              query,
              "followers",
              "desc",
              10,
              page
            );
            break;
          default:
            throw new Error(`Unsupported search type: ${selected}`);
        }

        setSearchResults(data);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Search failed, please try again later";
        console.error("Search failed:", error);
        setSearchResults(null);
        setError(errorMessage);
      } finally {
        setIsSearching(false);
      }
    },
    [selected]
  );

  const handlePageChange = (newPage: number) => {
    if (debouncedSearch.trim() && newPage > 0) {
      setCurrentPage(newPage);
      performSearch(debouncedSearch, newPage);
    }
  };

  const handleRefresh = () => {
    if (debouncedSearch.trim()) {
      performSearch(debouncedSearch, currentPage);
    }
  };

  // Reset search when search type changes
  useEffect(() => {
    setSearchResults(null);
    setError(null);
    setCurrentPage(1);
    if (debouncedSearch.trim()) {
      performSearch(debouncedSearch, 1);
    }
  }, [selected, performSearch]);

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSearchResults(null);
      setCurrentPage(1);
      setError(null);
      return;
    }

    setCurrentPage(1);
    performSearch(debouncedSearch, 1);
  }, [debouncedSearch, performSearch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <main className="w-full max-w-7xl mx-auto px-6">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight">GitHub Search</h1>
            <p className="text-xl text-muted-foreground">
              Search for GitHub {selected}
            </p>
          </div>

          <div className="w-full max-w-4xl mx-auto space-y-4">
            <div className="flex items-center gap-3">
              <Select value={selected} onValueChange={setSelected}>
                <SelectTrigger className="text-lg !h-12 flex items-center w-40">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    </div>
                  ) : (
                    <SelectValue />
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="repositories">Repositories</SelectItem>

                  <SelectItem value="code">Code</SelectItem>
                  <SelectItem value="commits">Commits</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder={`Search GitHub ${selected}...`}
                className="flex-1 h-12 text-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <ModeToggle />
            </div>

            <Separator />

            {error && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-4 mb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Search Error
                    </h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                      <p>{error}</p>
                      {error.includes("rate limit") && (
                        <div className="mt-2">
                          <p className="mt-1">
                            Please{" "}
                            <a
                              href="https://github.com/settings/tokens"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              generate a GitHub Personal Access Token
                            </a>{" "}
                            (public_repo permission) and add it as
                            NEXT_PUBLIC_GITHUB_TOKEN=your_token_here in a
                            .env.local file.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={handleRefresh}
                    disabled={isSearching || !debouncedSearch.trim()}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900"
                  >
                    <RefreshCw
                      className={`h-3 w-3 ${isSearching ? "animate-spin" : ""}`}
                    />
                    Retry
                  </Button>
                </div>
              </div>
            )}

            <div>
              <ResultTable
                data={searchResults?.items || []}
                isLoading={isSearching}
                totalCount={searchResults?.total_count || 0}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                searchType={selected}
                searchQuery={debouncedSearch}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
