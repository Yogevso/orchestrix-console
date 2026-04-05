import { useQuery } from '@tanstack/react-query';
import { getWorkers } from '@/services/engineApi';
import { PageHeader, LoadingSpinner, EmptyState, ErrorMessage } from '@/components/ui';
import { usePageTitle } from '@/hooks/usePageTitle';
import { formatDate, relativeTime, cn } from '@/utils';
import { Server } from 'lucide-react';
import type { EngineWorkerStatus } from '@/types/engine';

const WORKER_STATUS_COLORS: Record<EngineWorkerStatus, string> = {
  ONLINE: 'text-green-400 bg-green-400/10 border-green-400/30',
  OFFLINE: 'text-gray-400 bg-gray-400/10 border-gray-400/30',
  DRAINING: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
};

const WORKER_STATUS_DOT: Record<EngineWorkerStatus, string> = {
  ONLINE: 'bg-green-400 animate-pulse',
  OFFLINE: 'bg-gray-500',
  DRAINING: 'bg-yellow-400 animate-pulse',
};

export default function Workers() {
  usePageTitle('Workers');
  const { data: workers, isLoading, error, refetch } = useQuery({
    queryKey: ['engine-workers'],
    queryFn: getWorkers,
    refetchInterval: 10_000,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load workers" onRetry={refetch} />;

  const online = workers?.filter((w) => w.status === 'ONLINE').length ?? 0;
  const total = workers?.length ?? 0;

  return (
    <div>
      <PageHeader title="Workers" subtitle={`${online} online / ${total} total`} />

      {!workers || workers.length === 0 ? (
        <EmptyState icon={Server} title="No workers registered" description="Workers will appear here when they connect to the Engine." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {workers.map((worker) => (
            <div key={worker.id} className="bg-surface rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Server className="w-4 h-4 text-text-muted shrink-0" />
                  <span className="text-sm font-medium text-white truncate">{worker.name}</span>
                </div>
                <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', WORKER_STATUS_COLORS[worker.status])}>
                  <span className={cn('w-1.5 h-1.5 rounded-full', WORKER_STATUS_DOT[worker.status])} />
                  {worker.status}
                </span>
              </div>

              <div className="space-y-2 text-xs text-text-muted">
                <div className="flex justify-between">
                  <span>Queues</span>
                  <span className="text-text">{worker.queues.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Running / Max</span>
                  <span className="text-text">{worker.running_count} / {worker.max_concurrency}</span>
                </div>
                {worker.capabilities.length > 0 && (
                  <div className="flex justify-between">
                    <span>Capabilities</span>
                    <span className="text-text">{worker.capabilities.join(', ')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Last Heartbeat</span>
                  <span className="text-text">{worker.last_heartbeat_at ? relativeTime(worker.last_heartbeat_at) : 'Never'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Registered</span>
                  <span className="text-text">{formatDate(worker.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
