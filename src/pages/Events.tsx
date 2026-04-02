import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchEvents } from '@/api/endpoints';
import { useLiveEvents } from '@/hooks/useLiveEvents';
import { PageHeader, SeverityBadge, FilterSelect, LoadingSpinner, EmptyState } from '@/components/ui';
import { TimeRangeSelector, filterByTimeRange } from '@/components/TimeRangeSelector';
import type { TimeRange } from '@/components/TimeRangeSelector';
import { formatDate, relativeTime } from '@/utils';
import type { SystemEvent, EventSeverity, EventType } from '@/types';
import { Radio, Wifi, WifiOff, Trash2 } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useUrlFilters } from '@/hooks/useUrlFilters';

const SEVERITY_OPTIONS = [
  { value: '', label: 'All severities' },
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
  { value: 'critical', label: 'Critical' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'system', label: 'System' },
  { value: 'application', label: 'Application' },
  { value: 'security', label: 'Security' },
  { value: 'performance', label: 'Performance' },
  { value: 'anomaly', label: 'Anomaly' },
];

const SOURCE_OPTIONS = [
  { value: '', label: 'All sources' },
  { value: 'orchestrix-core', label: 'Orchestrix Core' },
  { value: 'syswatch', label: 'SysWatch' },
  { value: 'packet-analyzer', label: 'Packet Analyzer' },
  { value: 'embedded-tester', label: 'Embedded Tester' },
  { value: 'api-gateway', label: 'API Gateway' },
  { value: 'identity-service', label: 'Identity Service' },
];

export default function Events() {
  usePageTitle('Events');
  const { filters, setFilter } = useUrlFilters({ severity: '', type: '', source: '' });
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [showLive, setShowLive] = useState(true);
  const { events: liveEvents, isConnected, stop, start, clear } = useLiveEvents(showLive);

  const { data: historicalEvents, isLoading } = useQuery({
    queryKey: ['events', filters.severity, filters.type, filters.source],
    queryFn: () => fetchEvents({
      severity: (filters.severity || undefined) as EventSeverity | undefined,
      type: (filters.type || undefined) as EventType | undefined,
      source: filters.source || undefined,
    }),
  });

  // Merge live events on top of historical, apply filters
  let allEvents: SystemEvent[] = [...liveEvents, ...(historicalEvents ?? [])];
  if (filters.severity) allEvents = allEvents.filter((e) => e.severity === filters.severity);
  if (filters.type) allEvents = allEvents.filter((e) => e.type === filters.type);
  if (filters.source) allEvents = allEvents.filter((e) => e.source === filters.source);
  allEvents = filterByTimeRange(allEvents, timeRange, (e) => e.timestamp);

  return (
    <div>
      <PageHeader title="Events & Alerts" subtitle="Live system event feed">
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        <div className="flex items-center gap-2">
          <button
            onClick={() => { if (isConnected) stop(); else start(); setShowLive(!showLive); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isConnected
                ? 'text-green-400 bg-green-400/10 border-green-400/30 hover:bg-green-400/20'
                : 'text-text-muted bg-surface-light border-border hover:text-text'
            }`}
          >
            {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {isConnected ? 'Live' : 'Paused'}
          </button>
          {liveEvents.length > 0 && (
            <button
              onClick={clear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-text-muted bg-surface-light border border-border hover:text-text transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear ({liveEvents.length})
            </button>
          )}
        </div>
        <FilterSelect label="Severity" value={filters.severity} onChange={(v) => setFilter('severity', v)} options={SEVERITY_OPTIONS} />
        <FilterSelect label="Type" value={filters.type} onChange={(v) => setFilter('type', v)} options={TYPE_OPTIONS} />
        <FilterSelect label="Source" value={filters.source} onChange={(v) => setFilter('source', v)} options={SOURCE_OPTIONS} />
      </PageHeader>

      {/* Live indicator */}
      {isConnected && (
        <div className="flex items-center gap-2 mb-4 text-xs text-green-400">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Streaming live events — {liveEvents.length} received this session
        </div>
      )}

      {isLoading && <LoadingSpinner />}

      {allEvents.length === 0 && !isLoading && (
        <EmptyState icon={Radio} title="No events found" description="Try adjusting your filters or wait for live events" />
      )}

      {allEvents.length > 0 && (
        <div className="space-y-2">
          {allEvents.map((event, i) => (
            <div
              key={`${event.id}-${i}`}
              className={`bg-surface rounded-xl border border-border px-5 py-4 flex items-start justify-between gap-4 hover:bg-surface-light transition-all ${
                liveEvents.includes(event) ? 'animate-[fadeIn_0.3s_ease-out]' : ''
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <SeverityBadge severity={event.severity} />
                  <span className="text-xs text-text-muted bg-surface-lighter px-2 py-0.5 rounded">{event.type}</span>
                  {liveEvents.includes(event) && (
                    <span className="text-xs text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded border border-green-400/30">LIVE</span>
                  )}
                </div>
                <p className="text-sm text-white mt-1.5">{event.message}</p>
                <p className="text-xs text-text-muted mt-1">
                  {event.source} · {formatDate(event.timestamp)}
                </p>
              </div>
              <span className="text-xs text-text-muted whitespace-nowrap shrink-0">{relativeTime(event.timestamp)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
