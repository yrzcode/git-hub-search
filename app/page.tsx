"use client";

import { ResultTable } from "@/components/search-result-table";
import { ModeToggle } from "@/components/theme-toggle";
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
import { searchRepositories } from "@/lib/searchGithubAxios";
import type { Repository, SearchResponse } from "@/types/github";
import { useEffect, useState } from "react";

export default function Home() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [selected, setSelected] = useState("repositories");
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] =
    useState<SearchResponse<Repository> | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSearchResults(null);
      return;
    }

    const fetchData = async () => {
      setIsSearching(true);
      try {
        const data = await searchRepositories(debouncedSearch);
        setSearchResults(data);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults(null);
      } finally {
        setIsSearching(false);
      }
    };

    fetchData();
  }, [debouncedSearch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <main className="w-full max-w-4xl mx-auto px-6">
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
                  <SelectItem value="issues">Issues</SelectItem>
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

            <div>
              <ResultTable
                data={searchResults?.items || []}
                isLoading={isSearching}
                totalCount={searchResults?.total_count || 0}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
