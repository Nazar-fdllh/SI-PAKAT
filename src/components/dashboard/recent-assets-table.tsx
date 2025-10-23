import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  import { Badge } from "@/components/ui/badge"
  import { getEnrichedAssets } from "@/lib/data"
  
  export default function RecentAssetsTable() {
    const recentAssets = getEnrichedAssets()
      // Assuming no creation date in new structure, sort by ID as a proxy for recency
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);
  
    return (
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
          {recentAssets.map((asset) => (
            <TableRow key={asset.id}>
              <TableCell className="font-medium">{asset.asset_name}</TableCell>
              <TableCell>{asset.category_name}</TableCell>
              <TableCell>{asset.owner}</TableCell>
              <TableCell className="text-right font-medium">{asset.asset_value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }
  