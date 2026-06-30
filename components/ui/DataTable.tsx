// components/ui/DataTable.tsx
'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  onSearchChange?: (val: string) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search records...',
  onSearchChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  React.useEffect(() => {
    if (onSearchChange) {
      onSearchChange(globalFilter);
    }
  }, [globalFilter, onSearchChange]);

  return (
    <div className="flex flex-col gap-4 w-full">
      {searchKey && (
        <div className="flex items-center">
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-xs"
            prefixIcon={<Search className="w-4 h-4 text-zinc-500" />}
          />
        </div>
      )}
      
      <div className="rounded-xl border border-zinc-850 bg-zinc-900/40 overflow-hidden overflow-x-auto relative">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-zinc-800 bg-zinc-900/60 select-none">
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-zinc-800/40 transition-colors"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <ArrowUpDown className="w-3.5 h-3.5 opacity-55 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-zinc-850">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-zinc-800/10 transition-colors text-zinc-200"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 font-medium text-xs whitespace-nowrap align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center text-zinc-500 font-medium">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2 py-1 select-none">
        <div className="text-xs text-zinc-500 font-medium">
          Showing {table.getRowModel().rows?.length || 0} of {data.length} records
        </div>
        <div className="flex items-center gap-6 lg:gap-8">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-zinc-500">Rows per page</p>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className="h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 px-2 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-xs font-medium text-zinc-400">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount() || 1}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="secondary"
              className="h-8 w-8 p-0"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              className="h-8 w-8 p-0"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
