import { useQuery } from '@tanstack/react-query';
import { fetchAuditLogs } from '@/api/endpoints';
import { PageHeader, FilterSelect, LoadingSpinner, EmptyState } from '@/components/ui';
import { formatDate } from '@/utils';
import type { AuditAction } from '@/types';
import { FileText } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useUrlFilters } from '@/hooks/useUrlFilters';

const USER_OPTIONS = [
  { value: '', label: 'All users' },
  { value: 'admin', label: 'admin' },
  { value: 'yogev', label: 'yogev' },
  { value: 'operator-1', label: 'operator-1' },
  { value: 'ci-bot', label: 'ci-bot' },
  { value: 'sre-team', label: 'sre-team' },
];

const ACTION_OPTIONS = [
  { value: '', label: 'All actions' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'job_retry', label: 'Job Retry' },
  { value: 'job_cancel', label: 'Job Cancel' },
  { value: 'config_change', label: 'Config Change' },
  { value: 'user_create', label: 'User Create' },
  { value: 'incident_resolve', label: 'Incident Resolve' },
];

const ACTION_COLORS: Record<string, string> = {
  login: 'text-green-400',
  logout: 'text-gray-400',
  job_retry: 'text-yellow-400',
  job_cancel: 'text-red-400',
  config_change: 'text-blue-400',
  user_create: 'text-purple-400',
  incident_resolve: 'text-green-400',
};

export default function AuditLogs() {
  usePageTitle('Audit Logs');
  const { filters, setFilter } = useUrlFilters({ user: '', action: '' });

  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs', filters.user, filters.action],
    queryFn: () => fetchAuditLogs({
      user: filters.user || undefined,
      action: (filters.action || undefined) as AuditAction | undefined,
    }),
  });

  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="Track user and system actions">
        <FilterSelect label="User" value={filters.user} onChange={(v) => setFilter('user', v)} options={USER_OPTIONS} />
        <FilterSelect label="Action" value={filters.action} onChange={(v) => setFilter('action', v)} options={ACTION_OPTIONS} />
      </PageHeader>

      {isLoading && <LoadingSpinner />}

      {logs && logs.length === 0 && (
        <EmptyState icon={FileText} title="No audit logs found" description="Try adjusting your filters" />
      )}

      {logs && logs.length > 0 && (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-text-muted px-5 py-3">Timestamp</th>
                <th className="text-left text-xs font-medium text-text-muted px-5 py-3">User</th>
                <th className="text-left text-xs font-medium text-text-muted px-5 py-3">Action</th>
                <th className="text-left text-xs font-medium text-text-muted px-5 py-3">Target</th>
                <th className="text-left text-xs font-medium text-text-muted px-5 py-3">Details</th>
                <th className="text-left text-xs font-medium text-text-muted px-5 py-3">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-light transition-colors">
                  <td className="px-5 py-3 text-sm text-text-muted whitespace-nowrap">{formatDate(log.timestamp)}</td>
                  <td className="px-5 py-3 text-sm text-white">{log.user}</td>
                  <td className="px-5 py-3">
                    <span className={`text-sm font-medium ${ACTION_COLORS[log.action] ?? 'text-text'}`}>
                      {log.action.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-text-muted font-mono">{log.target}</td>
                  <td className="px-5 py-3 text-sm text-text-muted">{log.details}</td>
                  <td className="px-5 py-3 text-xs text-text-muted font-mono">{log.ip_address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
