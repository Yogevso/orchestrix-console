import { useQuery } from '@tanstack/react-query';
import { fetchJobs, fetchEvents, fetchAnalytics, fetchIncidents } from '@/api/endpoints';
import { PageHeader, SummaryCard, StatusBadge, SeverityBadge, LoadingSpinner } from '@/components/ui';
import { formatDate } from '@/utils';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertTriangle, Server, Brain, Activity, Shield, Cpu, Users, GitBranch, BarChart3 } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { fetchWorkers, fetchQueueStats } from '@/services/engineApi';
import { fetchHostMetrics } from '@/services/insightsApi';

function SourceChip({ source }: { source: string }) {
  const styles: Record<string, string> = {
    engine: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    insights: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    ai: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
    iam: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  };
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium uppercase tracking-wider ${styles[source] ?? 'text-text-muted border-border'}`}>
      {source}
    </span>
  );
}

export default function Dashboard() {
  usePageTitle('Dashboard');
  const jobsQuery = useQuery({ queryKey: ['jobs'], queryFn: () => fetchJobs({ per_page: 5 }) });
  const eventsQuery = useQuery({ queryKey: ['events-recent'], queryFn: () => fetchEvents() });
  const analyticsQuery = useQuery({ queryKey: ['analytics'], queryFn: fetchAnalytics });
  const incidentsQuery = useQuery({ queryKey: ['incidents'], queryFn: fetchIncidents });
  const workersQuery = useQuery({ queryKey: ['engine-workers'], queryFn: fetchWorkers, retry: false });
  const queuesQuery = useQuery({ queryKey: ['engine-queues'], queryFn: fetchQueueStats, retry: false });
  const hostsQuery = useQuery({ queryKey: ['insights-hosts'], queryFn: fetchHostMetrics, retry: false });

  if (analyticsQuery.isLoading) return <LoadingSpinner />;

  const analytics = analyticsQuery.data;
  const recentJobs = jobsQuery.data?.items ?? [];
  const recentEvents = (eventsQuery.data ?? []).slice(0, 5);
  const activeIncidents = (incidentsQuery.data ?? []).filter((i) => i.status !== 'resolved');
  const workers = workersQuery.data ?? [];
  const queues = queuesQuery.data ?? [];
  const hosts = hostsQuery.data?.hosts ?? [];
  const onlineWorkers = workers.filter((w) => w.status === 'ONLINE').length;
  const totalQueued = queues.reduce((sum, q) => sum + (q.queued ?? 0), 0);

  return (
    <div>
      <PageHeader title="Orchestrix Platform" subtitle="Unified view across execution, telemetry, and intelligence" />

      {/* Platform Service Status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-surface rounded-lg border border-border p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-400/10 flex items-center justify-center"><Server className="w-4 h-4 text-blue-400" /></div>
          <div><p className="text-xs text-text-muted">Engine</p><p className="text-sm font-semibold text-white">{onlineWorkers} workers</p></div>
        </div>
        <div className="bg-surface rounded-lg border border-border p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center"><Activity className="w-4 h-4 text-emerald-400" /></div>
          <div><p className="text-xs text-text-muted">Insights</p><p className="text-sm font-semibold text-white">{hosts.length} hosts</p></div>
        </div>
        <div className="bg-surface rounded-lg border border-border p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-400/10 flex items-center justify-center"><Brain className="w-4 h-4 text-purple-400" /></div>
          <div><p className="text-xs text-text-muted">AI</p><p className="text-sm font-semibold text-white">{activeIncidents.length} active</p></div>
        </div>
        <div className="bg-surface rounded-lg border border-border p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center"><Shield className="w-4 h-4 text-amber-400" /></div>
          <div><p className="text-xs text-text-muted">IAM</p><p className="text-sm font-semibold text-white">Connected</p></div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard title="Total Jobs" value={analytics?.total_jobs ?? 0} subtitle="Last 14 days" />
        <SummaryCard title="Failed Jobs" value={analytics?.failed_jobs ?? 0} color="text-red-400" subtitle={`${analytics?.success_rate ?? 0}% success rate`} />
        <SummaryCard title="Queued" value={totalQueued} subtitle={`Across ${queues.length} queues`} />
        <SummaryCard title="Critical Events" value={analytics?.critical_events ?? 0} color="text-red-400" subtitle="Requires attention" />
      </div>

      {/* Active Incidents Banner */}
      {activeIncidents.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-sm font-medium text-red-400">{activeIncidents.length} Active Incident{activeIncidents.length > 1 ? 's' : ''}</p>
                <p className="text-xs text-text-muted mt-0.5">{activeIncidents[0].title}</p>
              </div>
            </div>
            <Link to="/incidents" className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1">
              View <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Quick Navigation Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Link to="/workers" className="bg-surface rounded-lg border border-border p-3 hover:border-primary/30 hover:bg-surface-light transition-all flex items-center gap-2">
          <Users className="w-4 h-4 text-text-muted" /><span className="text-sm text-white">Workers</span><SourceChip source="engine" />
        </Link>
        <Link to="/workflow-runs" className="bg-surface rounded-lg border border-border p-3 hover:border-primary/30 hover:bg-surface-light transition-all flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-text-muted" /><span className="text-sm text-white">Workflows</span><SourceChip source="engine" />
        </Link>
        <Link to="/telemetry" className="bg-surface rounded-lg border border-border p-3 hover:border-primary/30 hover:bg-surface-light transition-all flex items-center gap-2">
          <Cpu className="w-4 h-4 text-text-muted" /><span className="text-sm text-white">Telemetry</span><SourceChip source="insights" />
        </Link>
        <Link to="/incidents" className="bg-surface rounded-lg border border-border p-3 hover:border-primary/30 hover:bg-surface-light transition-all flex items-center gap-2">
          <Brain className="w-4 h-4 text-text-muted" /><span className="text-sm text-white">Incidents</span><SourceChip source="ai" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="bg-surface rounded-xl border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">Recent Jobs <SourceChip source="engine" /></h2>
            <Link to="/jobs" className="text-xs text-primary hover:text-primary-light flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentJobs.map((job) => (
              <Link key={job.id} to={`/jobs/${job.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-surface-light transition-colors">
                <div className="min-w-0 mr-3">
                  <p className="text-sm text-white truncate">{job.name}</p>
                  <p className="text-xs text-text-muted">{formatDate(job.created_at)}</p>
                </div>
                <StatusBadge status={job.status} />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-surface rounded-xl border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">Recent Events <SourceChip source="engine" /></h2>
            <Link to="/events" className="text-xs text-primary hover:text-primary-light flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0 mr-3">
                  <p className="text-sm text-white truncate">{event.message}</p>
                  <p className="text-xs text-text-muted">{event.source} · {formatDate(event.timestamp)}</p>
                </div>
                <SeverityBadge severity={event.severity} />
              </div>
            ))}
          </div>
        </div>

        {/* Host Telemetry Overview */}
        {hosts.length > 0 && (
          <div className="bg-surface rounded-xl border border-border">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">Host Health <SourceChip source="insights" /></h2>
              <Link to="/telemetry" className="text-xs text-primary hover:text-primary-light flex items-center gap-1">
                Details <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {hosts.slice(0, 4).map((host) => (
                <div key={host.hostname} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0 mr-3">
                    <p className="text-sm text-white">{host.hostname}</p>
                    <p className="text-xs text-text-muted">{host.process_count} processes</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-xs font-medium ${(host.avg_cpu ?? 0) > 80 ? 'text-red-400' : 'text-text-muted'}`}>CPU {(host.avg_cpu ?? 0).toFixed(0)}%</p>
                      <p className={`text-xs font-medium ${(host.avg_memory ?? 0) > 80 ? 'text-red-400' : 'text-text-muted'}`}>MEM {(host.avg_memory ?? 0).toFixed(0)}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Queue Stats */}
        {queues.length > 0 && (
          <div className="bg-surface rounded-xl border border-border">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">Queue Depths <SourceChip source="engine" /></h2>
              <Link to="/jobs" className="text-xs text-primary hover:text-primary-light flex items-center gap-1">
                View jobs <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {queues.slice(0, 4).map((q) => (
                <div key={q.queue_name} className="flex items-center justify-between px-5 py-3">
                  <p className="text-sm text-white font-mono">{q.queue_name}</p>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-yellow-400">{q.queued} queued</span>
                    <span className="text-blue-400">{q.running} running</span>
                    <span className="text-red-400">{q.dead_letter} dead</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
