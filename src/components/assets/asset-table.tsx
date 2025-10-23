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
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
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
import { type Asset, type UserRole, type AssetClassificationValue } from "@/lib/definitions"
import { initialClassifications } from "@/lib/data"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type AssetTableProps = {
  assets: Asset[];
  userRole: UserRole | null;
  onEdit: (asset: Asset) => void;
  onDelete: (assetId: number) => void;
};

export default function AssetTable({ assets, userRole, onEdit, onDelete }: AssetTableProps) {
  const [data, setData] = React.useState(assets);
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    identification_of_existence: false,
    sub_classification_id: false,
    owner: false,
    location: false,
  })
  const [rowSelection, setRowSelection] = React.useState({})

  React.useEffect(() => {
    setData(assets);
  }, [assets]);

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
      accessorKey: "asset_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nama Aset
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
          <Link href={`/assets/${row.original.id}`} className="font-medium hover:underline">
            {row.getValue("asset_name")}
          </Link>
        ),
    },
    {
      accessorKey: "asset_code",
      header: "Kode Aset",
    },
    {
        accessorKey: "category_name",
        header: "Kategori",
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: 'identification_of_existence',
        header: 'Identifikasi Keberadaan'
    },
    {
        accessorKey: 'location',
        header: 'Lokasi'
    },
    {
        accessorKey: 'owner',
        header: 'Pemilik'
    },
    {
      accessorKey: "asset_value",
      header: "Nilai Aset",
      cell: ({ row }) => {
        const classification = row.getValue("asset_value") as AssetClassificationValue;
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
        if (!canManage) return null;

        return (
          <AlertDialog>
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
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(asset)}>Edit Aset</DropdownMenuItem>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-red-500 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-900/40 dark:focus:text-red-400">Hapus Aset</DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Anda yakin ingin menghapus aset ini?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Ini akan menghapus aset <span className="font-semibold text-foreground">{asset.asset_name}</span> ({asset.asset_code}) secara permanen dari sistem.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(asset.id)} className={buttonVariants({ variant: "destructive" })}>Ya, Hapus Aset</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>
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
  
  const columnLabels: Record<string, string> = {
    asset_name: 'Nama Aset',
    asset_code: 'Kode Aset',
    category_name: 'Kategori',
    identification_of_existence: 'Identifikasi Keberadaan',
    location: 'Lokasi',
    owner: 'Pemilik',
    asset_value: 'Nilai Aset',
  };

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-2">
        <Input
          placeholder="Cari nama aset..."
          value={(table.getColumn("asset_name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("asset_name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Select
          value={((table.getColumn('category_name')?.getFilterValue() ?? []) as string[])[0] ?? ''}
          onValueChange={(value) => {
            table.getColumn('category_name')?.setFilterValue(value === 'all' ? undefined : [value]);
          }}
        >
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Filter Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {initialClassifications.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Kolom <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {columnLabels[column.id] || column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className={header.id === 'actions' ? 'text-right' : ''}>
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
                    <TableCell key={cell.id} className={cell.column.id === 'actions' ? 'text-right' : ''}>
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
                  {"Tidak ada hasil."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} dari{" "}
          {table.getFilteredRowModel().rows.length} baris dipilih.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Berikutnya
          </Button>
        </div>
      </div>
    </div>
  )
}
