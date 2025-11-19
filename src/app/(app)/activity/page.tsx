'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { getActivityLogs, getActivityLogById } from '@/lib/data';
import type { ActivityLog } from '@/lib/definitions';
import { useDebounce } from '@/hooks/use-debounce';
import ActivityTable from '@/components/activity/activity-table';
import { ActivityDrawer } from '@/components/activity/activity-drawer';

export default function ActivityPage() {
  const router = useRouter();
  const { role } = useSession();
  
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [sort, setSort] = useState<{ sort: string; order: 'asc' | 'desc' }>({ sort: 'created_at', order: 'desc' });

  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (role && role.name !== 'Administrator') {
      router.push('/dashboard');
    }
  }, [role, router]);

  const fetchLogs = useCallback(async () => {
    if (role?.name !== 'Administrator') return;
    setIsLoading(true);
    try {
      const data = await getActivityLogs({
        page,
        limit,
        search: debouncedSearchTerm,
        sort: sort.sort,
        order: sort.order,
      });
      setLogs(data.logs);
      setTotalLogs(data.total);
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [role, page, limit, debouncedSearchTerm, sort]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleRowClick = async (logId: number) => {
    try {
      const logDetails = await getActivityLogById(logId);
      setSelectedLog(logDetails);
      setIsDrawerOpen(true);
    } catch (error) {
      console.error('Failed to fetch log details:', error);
    }
  };

  if (!role || role.name !== 'Administrator') {
    return <div className="flex justify-center items-center h-full"><p>Mengalihkan...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Log Aktivitas Pengguna</h1>
        <p className="text-muted-foreground">
          Pantau semua aktivitas yang terjadi di dalam sistem.
        </p>
      </div>

      <ActivityTable
        logs={logs}
        totalLogs={totalLogs}
        isLoading={isLoading}
        page={page}
        limit={limit}
        setPage={setPage}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sort={sort}
        setSort={setSort}
        onRowClick={handleRowClick}
      />
      
      <ActivityDrawer
        log={selectedLog}
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
    </div>
  );
}
