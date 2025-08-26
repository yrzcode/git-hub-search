import { ResultTable } from "@/components/search-result-table";
import { ModeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <main className="w-full max-w-2xl mx-auto px-6">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight">
              GitHub Repo Search
            </h1>
            <p className="text-xl text-muted-foreground">
              Search for GitHub repositories
            </p>
          </div>

          <div className="w-full max-w-lg mx-auto space-y-4">
            <div className="flex items-center gap-3">
              <Input
                placeholder="Search GitHub repositories..."
                className="flex-1 h-12 text-lg"
              />
              <ModeToggle />
            </div>
            <div>
              <ResultTable />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
