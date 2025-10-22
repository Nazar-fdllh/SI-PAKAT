'use client'

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, FileDown, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { type Asset, type AssetCategory, type UserRole } from "@/lib/definitions"
import { cn } from "@/lib/utils"
import Link from "next/link"

type AssetTableProps = {
  initialAssets: Asset[];
  userRole: UserRole;
};

export default function AssetTable({ initialAssets, userRole }: AssetTableProps) {
  const [data, setData] = React.useState(initialAssets);
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const canManage = userRole === 'Administrator' || userRole === 'Manajer Aset';

  const columns: ColumnDef<Asset>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nama Aset
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "assetCode",
      header: "Kode Aset",
      cell: ({ row }) => <div>{row.getValue("assetCode")}</div>,
    },
    {
      accessorKey: "category",
      header: "Kategori",
      cell: ({ row }) => <div>{row.getValue("category")}</div>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge 
            variant={status === 'Aktif' ? 'default' : status === 'Non-Aktif' ? 'destructive' : 'secondary'}
            className={cn(
                status === 'Aktif' && 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30',
                status === 'Dalam Perbaikan' && 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/30',
                status === 'Akan Kadaluarsa' && 'bg-orange-500/20 text-orange-700 border-orange-500/30 hover:bg-orange-500/30',
                status === 'Non-Aktif' && 'bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30',
                'rounded-md'
            )}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "classification",
      header: "Klasifikasi",
      cell: ({ row }) => {
        const classification = row.getValue("classification") as string;
        return (
          <Badge 
            variant="outline"
            className={cn(
              classification === 'Tinggi' && 'text-red-600 border-red-400',
              classification === 'Sedang' && 'text-yellow-600 border-yellow-400',
              classification === 'Rendah' && 'text-blue-600 border-blue-400',
              'rounded-md'
            )}
          >
            {classification}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const asset = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <Link href={`/assets/${asset.id}`} passHref>
                <DropdownMenuItem>Lihat Detail</DropdownMenuItem>
              </Link>
              {canManage && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Edit Aset</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Hapus Aset</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ];

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
  })

  const categories: AssetCategory[] = ['Perangkat Keras', 'Perangkat Lunak', 'Sarana Pendukung', 'Data & Informasi'];

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-2">
        <Input
          placeholder="Cari nama aset..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Kategori <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {categories.map((category) => (
                <DropdownMenuCheckboxItem
                    key={category}
                    className="capitalize"
                    checked={(table.getColumn("category")?.getFilterValue() as string[])?.includes(category) ?? false}
                    onCheckedChange={(checked) => {
                        const currentFilter = (table.getColumn("category")?.getFilterValue() as string[]) || [];
                        const newFilter = checked
                        ? [...currentFilter, category]
                        : currentFilter.filter((c) => c !== category);
                        table.getColumn("category")?.setFilterValue(newFilter.length ? newFilter : undefined);
                    }}
                >
                    {category}
                </DropdownMenuCheckboxItem>
             ))}
          </DropdownMenuContent>
        </DropdownMenu>
         {userRole === 'Auditor/Pimpinan' && (
          <Link href="/print/report" passHref>
             <Button>
              <FileDown className="mr-2 h-4 w-4" /> Cetak Laporan
            </Button>
          </Link>
        )}
      </div>
      <div className="rounded-md border">
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
                  )
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
