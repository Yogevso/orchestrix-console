import { useQuery } from '@tanstack/react-query';
import { getHostMetrics, getServiceMetrics, getInsightsStats } from '@/services/insightsApi';
import { PageHeader, LoadingSpinner, EmptyState, ErrorMessage } from '@/components/ui';
import { usePageTitle } from '@/hooks/usePageTitle';
import { cn } from '@/utils';
import { Activity, Cpu, HardDrive, AlertTriangle } from 'lucide-react';

export default function Telemetry() {
  usePageTitle('Telemetry');

  const { data: hosts, isLoading: hostsLoading, error: hostsError } = useQuery({
    queryKey: ['insights-hosts'],
    queryFn: () => getHostMetrics(),
    refetchInterval: 15_000,
  });

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['insights-services'],
    queryFn: () => getServiceMetrics(),
    refetchInterval: 15_000,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['insights-stats'],
    queryFn: () => getInsightsStats(),
    refetchInterval: 15_000,
  });

  const isLoading = hostsLoading || servicesLoading || statsLoading;
  if (isLoading) return <LoadingSpinner />;
  if (hostsError) return <ErrorMessage message="Failed to load telemetry data" />;

  const totalProcesses = stats?.processes.total_records ?? 0;
  const peakCpu = stats?.processes.peak_cpu ?? 0;
  const totalAlerts = stats?.alerts.total_count ?? 0;
  const totalConnections = stats?.connections.total_records ?? 0;

  return (
    <div>
      <PageHeader title="Telemetry" subtitle="System-wide host and service metrics" />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Activity} label="Processes" value={totalProcesses} />
        <StatCard icon={Cpu} label="Peak CPU" value={`${peakCpu.toFixed(1)}%`} warn={peakCpu > 80} />
        <StatCard icon={AlertTriangle} label="Alerts" value={totalAlerts} warn={totalAlerts > 0} />
        <StatCard icon={HardDrive} label="Connections" value={totalConnections} />
      </div>

      {/* Host metrics */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Hosts</h2>
        {!hosts || hosts.hosts.length === 0 ? (
          <EmptyState icon={Activity} title="No host data" description="Host metrics will appear when the system-insights collector reports data." />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {hosts.hosts.map((h) => (
              <div key={h.source} className="bg-surface rounded-xl border border-border p-5">
                <div className="flex items-center gap-2 mb-3">
                  <HardDrive className="w-4 h-4 text-text-muted" />
                  <span className="text-sm font-medium text-white truncate">{h.source}</span>
                </div>
                <div className="space-y-2 text-xs text-text-muted">
                  <MetricRow label="Avg CPU" value={`${h.avg_cpu.toFixed(1)}%`} warn={h.avg_cpu > 70} />
                  <MetricRow label="Peak CPU" value={`${h.peak_cpu.toFixed(1)}%`} warn={h.peak_cpu > 90} />
                  <MetricRow label="Peak Memory" value={formatKb(h.peak_mem_kb)} />
                  <MetricRow label="Processes" value={h.process_count} />
                  <MetricRow label="Connections" value={h.connection_count} />
                  <MetricRow label="Alerts" value={h.alert_count} warn={h.alert_count > 0} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Service metrics */}
      <section>
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Services</h2>
        {!services || services.services.length === 0 ? (
          <EmptyState icon={Cpu} title="No service data" description="Service metrics will appear when process data is ingested." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-muted text-xs uppercase border-b border-border">
                  <th className="pb-2 pr-4">Service</th>
                  <th className="pb-2 pr-4">Instances</th>
                  <th className="pb-2 pr-4">Avg CPU</th>
                  <th className="pb-2 pr-4">Peak CPU</th>
                  <th className="pb-2 pr-4">Avg Memory</th>
                  <th className="pb-2">Peak Memory</th>
                </tr>
              </thead>
              <tbody>
                {services.services.map((s) => (
                  <tr key={s.name} className="border-b border-border/50 text-text">
                    <td className="py-2 pr-4 font-medium text-white">{s.name}</td>
                    <td className="py-2 pr-4">{s.instance_count}</td>
                    <td className={cn('py-2 pr-4', s.avg_cpu > 70 && 'text-yellow-400')}>{s.avg_cpu.toFixed(1)}%</td>
                    <td className={cn('py-2 pr-4', s.peak_cpu > 90 && 'text-red-400')}>{s.peak_cpu.toFixed(1)}%</td>
                    <td className="py-2 pr-4">{formatKb(s.avg_mem_kb)}</td>
                    <td className="py-2">{formatKb(s.peak_mem_kb)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

/* ── Helper components ── */

function StatCard({ icon: Icon, label, value, warn }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; warn?: boolean }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={cn('w-4 h-4', warn ? 'text-red-400' : 'text-text-muted')} />
        <span className="text-xs text-text-muted">{label}</span>
      </div>
      <span className={cn('text-2xl font-bold', warn ? 'text-red-400' : 'text-white')}>{value}</span>
    </div>
  );
}

function MetricRow({ label, value, warn }: { label: string; value: string | number; warn?: boolean }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className={cn('text-text', warn && 'text-red-400 font-medium')}>{value}</span>
    </div>
  );
}

function formatKb(kb: number): string {
  if (kb >= 1_048_576) return `${(kb / 1_048_576).toFixed(1)} GB`;
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
}
