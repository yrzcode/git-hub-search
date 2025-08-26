"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ExternalLink, GitFork, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  Repository,
  CodeSearchItem,
  Issue,
  CommitSearchItem,
  User,
} from "@/types/github";

const generatePageNumbers = (currentPage: number, totalPages: number) => {
  const pages: Array<{ value: number | string; key: string }> = [];
  const showPages = 7;

  if (totalPages <= showPages) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push({ value: i, key: `page-${i}` });
    }
  } else {
    if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push({ value: i, key: `page-${i}` });
      }
      pages.push({ value: "...", key: "ellipsis-end" });
      pages.push({ value: totalPages, key: `page-${totalPages}` });
    } else if (currentPage >= totalPages - 3) {
      pages.push({ value: 1, key: "page-1" });
      pages.push({ value: "...", key: "ellipsis-start" });
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push({ value: i, key: `page-${i}` });
      }
    } else {
      pages.push({ value: 1, key: "page-1" });
      pages.push({ value: "...", key: "ellipsis-start" });
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push({ value: i, key: `page-${i}` });
      }
      pages.push({ value: "...", key: "ellipsis-end" });
      pages.push({ value: totalPages, key: `page-${totalPages}` });
    }
  }

  return pages;
};

// Repository columns
export const repositoryColumns: ColumnDef<Repository>[] = [
  {
    accessorKey: "full_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Repository
          <ArrowUpDown />
        </Button>
      );
    },
    size: 300,
    cell: ({ row }) => {
      const repo = row.original;
      return (
        <div className="space-y-1 text-left pl-3 max-w-xs">
          <div className="font-medium">
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline flex items-center gap-1"
            >
              {repo.full_name}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          {repo.description && (
            <div className="text-sm text-muted-foreground max-w-md text-left truncate">
              {repo.description}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "language",
    header: "Language",
    cell: ({ row }) => {
      const language = row.getValue("language") as string;
      return (
        <div className="text-sm text-left pl-3">
          {language || <span className="text-muted-foreground">N/A</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "stargazers_count",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="justify-start w-full"
        >
          Stars
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const stars = row.getValue("stargazers_count") as number;
      return (
        <div className="text-left flex items-center justify-start gap-1 pl-3">
          <Star className="h-3 w-3" />
          {stars?.toLocaleString() || "0"}
        </div>
      );
    },
  },
  {
    accessorKey: "forks",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="justify-start w-full"
        >
          Forks
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const forks = row.getValue("forks") as number;
      return (
        <div className="text-left flex items-center justify-start gap-1 pl-3">
          <GitFork className="h-3 w-3" />
          {forks?.toLocaleString() || "0"}
        </div>
      );
    },
  },
];

interface ResultTableProps {
  data: any[];
  isLoading: boolean;
  totalCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  searchType: string;
}

// Create dynamic columns based on search type
const createColumns = (searchType: string): ColumnDef<any>[] => {
  switch (searchType) {
    case "repositories":
      return repositoryColumns;
    case "issues":
      return [
        {
          accessorKey: "title",
          header: "Issue",
          cell: ({ row }) => {
            const issue = row.original as Issue;
            return (
              <div className="space-y-1 text-left">
                <div className="font-medium">
                  <a
                    href={issue.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center gap-1"
                  >
                    #{issue.number}: {issue.title}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                {issue.body && (
                  <p className="text-sm text-muted-foreground line-clamp-2 text-left">
                    {issue.body?.substring(0, 100) || "No description"}...
                  </p>
                )}
              </div>
            );
          },
        },
        {
          accessorKey: "state",
          header: "State",
          cell: ({ row }) => {
            const state = row.getValue("state") as string;
            return (
              <span
                className={`px-2 py-1 rounded text-xs ${
                  state === "open"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {state}
              </span>
            );
          },
        },
        {
          accessorKey: "comments",
          header: "Comments",
          cell: ({ row }) => {
            const comments = row.getValue("comments") as number;
            return <div className="text-left">{comments || 0}</div>;
          },
        },
      ];
    case "code":
      return [
        {
          accessorKey: "name",
          header: "File",
          cell: ({ row }) => {
            const code = row.original as CodeSearchItem;
            return (
              <div className="space-y-1 text-left">
                <div className="font-medium">
                  <a
                    href={code.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center gap-1"
                  >
                    {code.name}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <p className="text-sm text-muted-foreground text-left truncate">
                  {code.path || "No path"}
                </p>
              </div>
            );
          },
        },
        {
          accessorKey: "repository.full_name",
          header: "Repository",
          size: 250,
          cell: ({ row }) => {
            const code = row.original as CodeSearchItem;
            return (
              <div className="text-left max-w-xs">
                <a
                  href={code.repository?.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-blue-600 truncate block"
                >
                  {code.repository?.full_name || "Unknown repository"}
                </a>
              </div>
            );
          },
        },
      ];
    case "commits":
      return [
        {
          accessorKey: "sha",
          header: "Commit",
          cell: ({ row }) => {
            const commit = row.original as CommitSearchItem;
            return (
              <div className="font-medium text-left">
                <a
                  href={commit.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline flex items-center gap-1"
                >
                  {commit.sha?.substring(0, 7) || "unknown"}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            );
          },
        },
        {
          accessorKey: "commit.message",
          header: "Message",
          cell: ({ row }) => {
            const commit = row.original as CommitSearchItem;
            return (
              <div className="max-w-md">
                <p className="text-sm line-clamp-2 text-left">
                  {commit.commit?.message || "No message"}
                </p>
              </div>
            );
          },
        },
        {
          accessorKey: "commit.author.name",
          header: "Author",
          cell: ({ row }) => {
            const commit = row.original as CommitSearchItem;
            return (
              <div className="text-left">
                {commit.commit?.author?.name || "Unknown"}
              </div>
            );
          },
        },
        {
          accessorKey: "repository.full_name",
          header: "Repository",
          cell: ({ row }) => {
            const commit = row.original as CommitSearchItem;
            return (
              <div className="text-left">
                <a
                  href={commit.repository?.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-blue-600 truncate block"
                >
                  {commit.repository?.full_name || "Unknown repository"}
                </a>
              </div>
            );
          },
        },
      ];
    case "users":
      return [
        {
          accessorKey: "login",
          header: "User",
          cell: ({ row }) => {
            const user = row.original as User;
            return (
              <div className="flex items-center space-x-3 text-left max-w-xs">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                  {user.login?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="text-left">
                  <a
                    href={user.html_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:underline flex items-center gap-1"
                  >
                    <span className="truncate">
                      {user.login || "Unknown user"}
                    </span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  {user.name && (
                    <p className="text-sm text-muted-foreground text-left truncate">
                      {user.name}
                    </p>
                  )}
                </div>
              </div>
            );
          },
        },
        {
          accessorKey: "type",
          header: "Type",
          cell: ({ row }) => {
            const type = row.getValue("type") as string;
            return (
              <div className="text-left">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    type === "User"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {type}
                </span>
              </div>
            );
          },
        },
        {
          accessorKey: "score",
          header: "Relevance",
          cell: ({ row }) => {
            const score = row.getValue("score") as number;
            const percentage = Math.round(score * 100);
            return (
              <div className="text-left">
                <div className="text-sm font-medium">{percentage}%</div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          },
        },
      ];
    default:
      return repositoryColumns;
  }
};

export function ResultTable({
  data,
  isLoading,
  totalCount,
  currentPage,
  onPageChange,
  searchType,
}: ResultTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const totalPages = Math.ceil(Math.min(totalCount, 1000) / 10);
  const pageNumbers = generatePageNumbers(currentPage, totalPages);

  const columns = createColumns(searchType);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="px-6">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="px-6" key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-left px-6"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      Searching...
                    </div>
                  ) : (
                    "No results found."
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {totalCount > 0 && (
            <>
              Page {currentPage} • Showing{" "}
              {data.length > 0 ? (
                <>
                  {((currentPage - 1) * 10 + 1).toLocaleString()}-
                  {((currentPage - 1) * 10 + data.length).toLocaleString()}
                </>
              ) : (
                "0"
              )}{" "}
              of {Math.min(totalCount, 1000).toLocaleString()} {searchType}
              {totalCount > 1000 && (
                <span className="text-xs ml-1 opacity-75">
                  (GitHub API limit: max 1000 results)
                </span>
              )}
            </>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
          >
            Previous
          </Button>

          <div className="flex items-center space-x-1">
            {pageNumbers.map((pageItem) => (
              <React.Fragment key={pageItem.key}>
                {pageItem.value === "..." ? (
                  <span className="px-2 py-1 text-sm text-muted-foreground">
                    ...
                  </span>
                ) : (
                  <Button
                    variant={
                      pageItem.value === currentPage ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => onPageChange(pageItem.value as number)}
                    disabled={isLoading}
                    className="min-w-[2.5rem]"
                  >
                    {pageItem.value}
                  </Button>
                )}
              </React.Fragment>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={
              isLoading || data.length === 0 || currentPage >= totalPages
            }
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
