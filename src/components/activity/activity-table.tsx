'use client';

import * as React from "react";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { ArrowUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "../ui/skeleton";
import type { ActivityLog } from "@/lib/definitions";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

type ActivityTableProps = {
  logs: ActivityLog[];
  totalLogs: number;
  isLoading: boolean;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sort: { sort: string; order: 'asc' | 'desc' };
  setSort: (sort: { sort: string; order: 'asc' | 'desc' }) => void;
  onRowClick: (logId: number) => void;
};

export default function ActivityTable({
  logs,
  totalLogs,
  isLoading,
  page,
  limit,
  setPage,
  searchTerm,
  setSearchTerm,
  sort,
  setSort,
  onRowClick,
}: ActivityTableProps) {
  const pageCount = Math.ceil(totalLogs / limit);

  const columns = React.useMemo(() => [
    {
      accessorKey: "username",
      header: "Nama Pengguna",
      cell: ({ row }: any) => row.original.username || <span className="text-muted-foreground italic">Sistem</span>,
    },
    {
      accessorKey: "activity",
      header: "Aktivitas",
    },
    {
      accessorKey: "ip_address",
      header: "Alamat IP",
    },
    {
      accessorKey: "created_at",
      header: ({ column }: any) => (
        <Button
          variant="ghost"
          onClick={() =>
            setSort({
              sort: "created_at",
              order: sort.order === "asc" ? "desc" : "asc",
            })
          }
        >
          Waktu
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }: any) => format(new Date(row.original.created_at), 'dd MMM yyyy, HH:mm', { locale: id }),
    },
  ], [sort, setSort]);

  const table = useReactTable({
    data: logs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount,
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari aktivitas atau username..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: limit }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  <TableCell colSpan={columns.length} className="p-2">
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.original.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick(row.original.id)}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Menampilkan {logs.length} dari {totalLogs} log.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page >= pageCount}
          >
            Berikutnya
          </Button>
        </div>
      </div>
    </div>
  );
}
