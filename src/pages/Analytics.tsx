import { useQuery } from '@tanstack/react-query';
import { fetchAnalytics } from '@/api/endpoints';
import { PageHeader, SummaryCard, LoadingSpinner } from '@/components/ui';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

import type { PieLabelRenderProps } from 'recharts';
import { usePageTitle } from '@/hooks/usePageTitle';

const SEVERITY_COLORS_CHART: Record<string, string> = {
  info: '#3b82f6',
  warning: '#f59e0b',
  error: '#ef4444',
  critical: '#dc2626',
};

export default function Analytics() {
  usePageTitle('Analytics');
  const { data, isLoading } = useQuery({ queryKey: ['analytics'], queryFn: fetchAnalytics });

  if (isLoading || !data) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Analytics" subtitle="System health and performance insights" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard title="Total Jobs" value={data.total_jobs} subtitle="Last 14 days" />
        <SummaryCard title="Failed Jobs" value={data.failed_jobs} color="text-red-400" />
        <SummaryCard title="Success Rate" value={`${data.success_rate}%`} color="text-green-400" />
        <SummaryCard title="Total Events" value={data.total_events} subtitle={`${data.critical_events} critical`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Jobs Over Time */}
        <div className="bg-surface rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Jobs Over Time</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.jobs_over_time}>
              <defs>
                <linearGradient id="jobsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="failedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v: string) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e1e2e', border: '1px solid #3f3f5f', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Area type="monotone" dataKey="count" name="Total" stroke="#6366f1" fill="url(#jobsGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="failed" name="Failed" stroke="#ef4444" fill="url(#failedGrad)" strokeWidth={2} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Failure Rate */}
        <div className="bg-surface rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Failure Rate (%)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.failure_rate_over_time}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v: string) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e1e2e', border: '1px solid #3f3f5f', borderRadius: '8px', fontSize: '12px' }}
                formatter={(value) => [`${value}%`, 'Failure Rate']}
              />
              <Bar dataKey="rate" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Events by Severity */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Events by Severity</h3>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.events_by_severity}
                dataKey="count"
                nameKey="severity"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                label={(props: PieLabelRenderProps) => `${props.name}: ${props.value}`}
              >
                {data.events_by_severity.map((entry) => (
                  <Cell key={entry.severity} fill={SEVERITY_COLORS_CHART[entry.severity] ?? '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e1e2e', border: '1px solid #3f3f5f', borderRadius: '8px', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
