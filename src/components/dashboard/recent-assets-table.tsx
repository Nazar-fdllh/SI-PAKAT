
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import type { Asset } from "@/lib/definitions";
  
  export default function RecentAssetsTable({ assets }: { assets: Asset[] }) {
    const recentAssets = (assets || [])
      // Sort by ID descending as a proxy for recency
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);
  
    return (
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Aset</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Pemilik</TableHead>
              <TableHead className="text-right">Nilai Aset</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentAssets.length > 0 ? recentAssets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell className="font-medium">{asset.asset_name}</TableCell>
                <TableCell>{asset.category_name}</TableCell>
                <TableCell>{asset.owner}</TableCell>
                <TableCell className="text-right font-medium">{asset.asset_value || 'N/A'}</TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  Tidak ada aset terbaru untuk ditampilkan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    )
  }
  