import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  import { Badge } from "@/components/ui/badge"
  import { assets } from "@/lib/data"
  import { cn } from "@/lib/utils"
  import { format, parseISO } from "date-fns"
  import { id } from "date-fns/locale"
  
  export default function RecentAssetsTable() {
    const recentAssets = [...assets]
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
      .slice(0, 5);
  
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Aset</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tanggal Pembelian</TableHead>
            <TableHead className="text-right">Nilai</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentAssets.map((asset) => (
            <TableRow key={asset.id}>
              <TableCell className="font-medium">{asset.name}</TableCell>
              <TableCell>{asset.category}</TableCell>
              <TableCell>
                <Badge 
                  variant={asset.status === 'Aktif' ? 'default' : asset.status === 'Non-Aktif' ? 'destructive' : 'secondary'}
                  className={cn(
                      asset.status === 'Aktif' && 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30',
                      asset.status === 'Dalam Perbaikan' && 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/30',
                      asset.status === 'Akan Kadaluarsa' && 'bg-orange-500/20 text-orange-700 border-orange-500/30 hover:bg-orange-500/30',
                      asset.status === 'Non-Aktif' && 'bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30',
                      'rounded-md'
                  )}
                >
                  {asset.status}
                </Badge>
              </TableCell>
              <TableCell>{format(parseISO(asset.purchaseDate), 'dd MMM yyyy', { locale: id })}</TableCell>
              <TableCell className="text-right">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(asset.value)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }
  