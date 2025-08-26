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
import type { Repository } from "@/types/github";

export const columns: ColumnDef<Repository>[] = [
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
    cell: ({ row }) => {
      const repo = row.original;
      return (
        <div className="space-y-1">
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
            <div className="text-sm text-muted-foreground max-w-md truncate">
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
        <div className="text-sm">
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
          className="justify-end w-full"
        >
          Stars
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const stars = row.getValue("stargazers_count") as number;
      return (
        <div className="text-right flex items-center justify-end gap-1">
          <Star className="h-3 w-3" />
          {stars.toLocaleString()}
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
          className="justify-end w-full"
        >
          Forks
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const forks = row.getValue("forks") as number;
      return (
        <div className="text-right flex items-center justify-end gap-1">
          <GitFork className="h-3 w-3" />
          {forks.toLocaleString()}
        </div>
      );
    },
  },
];

interface ResultTableProps {
  data: Repository[];
  isLoading: boolean;
  totalCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function ResultTable({
  data,
  isLoading,
  totalCount,
  currentPage,
  onPageChange,
}: ResultTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

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
                    <TableHead key={header.id}>
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
                    <TableCell key={cell.id}>
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
                  className="h-24 text-center"
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
              of {Math.min(totalCount, 1000).toLocaleString()} repositories
              {totalCount > 1000 && (
                <span className="text-xs ml-1 opacity-75">
                  (GitHub API limit: max 1000 results)
                </span>
              )}
            </>
          )}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={
              isLoading ||
              data.length === 0 ||
              currentPage >= Math.ceil(Math.min(totalCount, 1000) / 10)
            }
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
