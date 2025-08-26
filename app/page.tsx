import { ModeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <main className="w-full max-w-2xl mx-auto px-6">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight">GitHub Search</h1>
            <p className="text-xl text-muted-foreground">Welcome to GitHub</p>
          </div>

          <div className="flex justify-center">
            <ModeToggle />
          </div>
        </div>
      </main>
    </div>
  );
}
