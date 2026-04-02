import { useQuery } from '@tanstack/react-query';
import { fetchJobs, fetchEvents, fetchAnalytics, fetchIncidents } from '@/api/endpoints';
import { PageHeader, SummaryCard, StatusBadge, SeverityBadge, LoadingSpinner } from '@/components/ui';
import { formatDate } from '@/utils';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function Dashboard() {
  usePageTitle('Dashboard');
  const jobsQuery = useQuery({ queryKey: ['jobs'], queryFn: () => fetchJobs({ per_page: 5 }) });
  const eventsQuery = useQuery({ queryKey: ['events-recent'], queryFn: () => fetchEvents() });
  const analyticsQuery = useQuery({ queryKey: ['analytics'], queryFn: fetchAnalytics });
  const incidentsQuery = useQuery({ queryKey: ['incidents'], queryFn: fetchIncidents });

  if (analyticsQuery.isLoading) return <LoadingSpinner />;

  const analytics = analyticsQuery.data;
  const recentJobs = jobsQuery.data?.items ?? [];
  const recentEvents = (eventsQuery.data ?? []).slice(0, 5);
  const activeIncidents = (incidentsQuery.data ?? []).filter((i) => i.status !== 'resolved');

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="System overview and recent activity" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard title="Total Jobs" value={analytics?.total_jobs ?? 0} subtitle="Last 14 days" />
        <SummaryCard title="Failed Jobs" value={analytics?.failed_jobs ?? 0} color="text-red-400" subtitle={`${analytics?.success_rate ?? 0}% success rate`} />
        <SummaryCard title="Total Events" value={analytics?.total_events ?? 0} subtitle="Last 7 days" />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="bg-surface rounded-xl border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-white">Recent Jobs</h2>
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
            <h2 className="text-sm font-semibold text-white">Recent Events</h2>
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
      </div>
    </div>
  );
}
