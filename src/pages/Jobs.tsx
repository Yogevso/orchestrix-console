import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { fetchJobs } from '@/api/endpoints';
import { PageHeader, StatusBadge, FilterSelect, LoadingSpinner, EmptyState, ErrorMessage } from '@/components/ui';
import Sparkline from '@/components/Sparkline';
import { formatDate } from '@/utils';
import { useKeyboardNav } from '@/hooks/useKeyboardNav';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import type { JobStatus, JobType } from '@/types';
import { Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'running', label: 'Running' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'retrying', label: 'Retrying' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'data_sync', label: 'Data Sync' },
  { value: 'report_generation', label: 'Report Gen' },
  { value: 'cleanup', label: 'Cleanup' },
  { value: 'notification', label: 'Notification' },
  { value: 'analysis', label: 'Analysis' },
  { value: 'migration', label: 'Migration' },
];

export default function Jobs() {
  usePageTitle('Jobs');
  const navigate = useNavigate();
  const { filters, setFilter } = useUrlFilters({ status: '', type: '' });
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['jobs', filters.status, filters.type, page],
    queryFn: () => fetchJobs({
      status: (filters.status || undefined) as JobStatus | undefined,
      type: (filters.type || undefined) as JobType | undefined,
      page,
      per_page: 15,
    }),
  });

  const itemCount = data?.items.length ?? 0;
  const onSelect = useCallback((index: number) => {
    if (data?.items[index]) navigate(`/jobs/${data.items[index].id}`);
  }, [data, navigate]);
  const { activeIndex } = useKeyboardNav(itemCount, onSelect);

  // Generate sparkline data per job (simulated execution profile)
  const sparklines = useMemo(() => {
    if (!data) return new Map<string, number[]>();
    const map = new Map<string, number[]>();
    for (const job of data.items) {
      const seed = job.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const points = Array.from({ length: 8 }, (_, i) => {
        const base = Math.sin(seed + i) * 30 + 50;
        return Math.max(5, Math.min(95, base + (Math.sin(seed * i) * 20)));
      });
      map.set(job.id, points);
    }
    return map;
  }, [data]);

  const totalPages = data ? Math.ceil(data.total / data.per_page) : 1;

  return (
    <div>
      <PageHeader title="Jobs" subtitle="Manage and monitor async workflows · j/k to navigate, Enter to open">
        <FilterSelect label="Status" value={filters.status} onChange={(v) => { setFilter('status', v); setPage(1); }} options={STATUS_OPTIONS} />
        <FilterSelect label="Type" value={filters.type} onChange={(v) => { setFilter('type', v); setPage(1); }} options={TYPE_OPTIONS} />
      </PageHeader>

      {isLoading && <LoadingSpinner />}
      {isError && <ErrorMessage message={(error as Error).message} onRetry={() => refetch()} />}

      {data && data.items.length === 0 && (
        <EmptyState icon={Briefcase} title="No jobs found" description="Try adjusting your filters" />
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-text-muted px-5 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-text-muted px-5 py-3">Type</th>
                  <th className="text-left text-xs font-medium text-text-muted px-5 py-3">Source</th>
                  <th className="text-left text-xs font-medium text-text-muted px-5 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-text-muted px-5 py-3">Activity</th>
                  <th className="text-left text-xs font-medium text-text-muted px-5 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.items.map((job, i) => (
                  <tr
                    key={job.id}
                    data-row-index={i}
                    className={`hover:bg-surface-light transition-colors cursor-pointer ${activeIndex === i ? 'bg-primary/10 ring-1 ring-primary/30' : ''}`}
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    <td className="px-5 py-3">
                      <Link to={`/jobs/${job.id}`} className="text-sm text-white hover:text-primary-light transition-colors" onClick={(e) => e.stopPropagation()}>
                        {job.name}
                      </Link>
                      <p className="text-xs text-text-muted font-mono">{job.id}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm text-text-muted">{job.type.replace('_', ' ')}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm text-text-muted">{job.source}</span>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-5 py-3">
                      <Sparkline
                        data={sparklines.get(job.id) ?? []}
                        color={job.status === 'failed' ? '#f87171' : job.status === 'completed' ? '#34d399' : '#818cf8'}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm text-text-muted">{formatDate(job.created_at)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-text-muted">
              Showing {(page - 1) * data.per_page + 1} - {Math.min(page * data.per_page, data.total)} of {data.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg bg-surface border border-border text-text-muted hover:text-white disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-text-muted px-2">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg bg-surface border border-border text-text-muted hover:text-white disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
