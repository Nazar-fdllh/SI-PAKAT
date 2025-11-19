'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import type { ActivityLog } from '@/lib/definitions';
import { format, parseISO, isValid } from 'date-fns';
import { id } from 'date-fns/locale';
import { Skeleton } from '../ui/skeleton';

interface ActivityDrawerProps {
  log: ActivityLog | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined) return null;
  return (
    <div className="flex flex-col space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-base text-foreground">{value}</p>
    </div>
  );
}

function formatDate(dateString?: string | null) {
    if (!dateString) return <span className="italic text-muted-foreground">Tidak tersedia</span>;
    const date = parseISO(dateString);
    return isValid(date) ? format(date, 'dd MMMM yyyy, HH:mm:ss', { locale: id }) : <span className="italic text-muted-foreground">Tanggal tidak valid</span>;
}


export function ActivityDrawer({ log, isOpen, onOpenChange }: ActivityDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-full">
        <SheetHeader>
          <SheetTitle className="font-headline text-xl">Detail Log Aktivitas</SheetTitle>
          <SheetDescription>
            Rincian lengkap dari aktivitas yang dipilih.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 py-6">
          {!log ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <>
              <DetailItem label="Aktivitas" value={log.activity} />
              <DetailItem label="Waktu Terjadi" value={formatDate(log.created_at)} />
              <DetailItem label="Alamat IP" value={log.ip_address} />
              <DetailItem label="User Agent" value={<span className="text-sm break-all">{log.user_agent}</span>} />

              <div className="pt-4 border-t">
                 <h4 className="text-lg font-semibold font-headline mb-4">Detail Pengguna</h4>
                 <DetailItem label="Nama Pengguna" value={log.user?.username || <span className="italic text-muted-foreground">Sistem/Tidak Dikenal</span>} />
                 <DetailItem label="Terakhir Login" value={formatDate(log.user?.last_login_at)} />
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
