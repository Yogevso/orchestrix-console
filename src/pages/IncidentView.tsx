import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchIncidents, fetchIncident } from '@/api/endpoints';
import { PageHeader, SeverityBadge, StatusBadge, LoadingSpinner, EmptyState } from '@/components/ui';
import { formatDate, formatDateFull, cn, SEVERITY_COLORS } from '@/utils';
import { AlertTriangle, Clock, ArrowRight, Briefcase, Radio, Zap, ChevronRight, Play } from 'lucide-react';
import type { Incident, IncidentTimelineEntry } from '@/types';
import { usePageTitle } from '@/hooks/usePageTitle';

const TIMELINE_ICONS: Record<string, typeof Clock> = {
  event: Radio,
  job: Briefcase,
  alert: AlertTriangle,
  action: Zap,
};

export default function IncidentView() {
  usePageTitle('Incidents');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: incidents, isLoading } = useQuery({ queryKey: ['incidents'], queryFn: fetchIncidents });
  const { data: incident } = useQuery({
    queryKey: ['incident', selectedId],
    queryFn: () => fetchIncident(selectedId!),
    enabled: !!selectedId,
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Incident Investigation" subtitle="Correlated system behavior analysis — trace cause to resolution" />

      {!selectedId ? (
        // Incident List
        <div>
          {incidents && incidents.length === 0 && (
            <EmptyState icon={AlertTriangle} title="No incidents" description="System is running smoothly" />
          )}

          <div className="space-y-3">
            {incidents?.map((inc) => (
              <button
                key={inc.id}
                onClick={() => setSelectedId(inc.id)}
                className="w-full text-left bg-surface rounded-xl border border-border p-5 hover:bg-surface-light hover:border-primary/30 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <SeverityBadge severity={inc.severity} />
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full border font-medium',
                        inc.status === 'resolved' ? 'text-green-400 bg-green-400/10 border-green-400/30' :
                        inc.status === 'investigating' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' :
                        'text-red-400 bg-red-400/10 border-red-400/30'
                      )}>
                        {inc.status}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-white mt-2">{inc.title}</h3>
                    <p className="text-sm text-text-muted mt-1 line-clamp-2">{inc.summary}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                      <span>{formatDate(inc.created_at)}</span>
                      <span>{inc.timeline.length} events in timeline</span>
                      <span>{inc.related_jobs.length} related jobs</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-primary-light transition-colors shrink-0 mt-1" />
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        // Incident Detail View
        <IncidentDetail incident={incident!} onBack={() => setSelectedId(null)} />
      )}
    </div>
  );
}

function IncidentDetail({ incident, onBack }: { incident: Incident | undefined; onBack: () => void }) {
  if (!incident) return <LoadingSpinner />;

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-white mb-4 transition-colors">
        <ArrowRight className="w-4 h-4 rotate-180" /> Back to Incidents
      </button>

      {/* Header */}
      <div className="bg-surface rounded-xl border border-border p-5 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <SeverityBadge severity={incident.severity} />
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full border font-medium',
                incident.status === 'resolved' ? 'text-green-400 bg-green-400/10 border-green-400/30' :
                incident.status === 'investigating' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' :
                'text-red-400 bg-red-400/10 border-red-400/30'
              )}>
                {incident.status}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">{incident.title}</h2>
            <p className="text-sm text-text-muted mt-1">ID: {incident.id} · Created {formatDateFull(incident.created_at)}</p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-surface-light rounded-lg border border-border">
          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Summary Insight</h4>
          <p className="text-sm text-text leading-relaxed">{incident.summary}</p>
        </div>
      </div>

      {/* Timeline - The main differentiator */}
      <div className="bg-surface rounded-xl border border-border p-5 mb-6">
        <h3 className="text-sm font-semibold text-white mb-6 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" /> Incident Timeline
        </h3>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />

          <div className="space-y-0">
            {incident.timeline.map((entry, i) => (
              <TimelineEntry key={entry.id} entry={entry} isLast={i === incident.timeline.length - 1} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Related Events */}
        <div className="bg-surface rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-400" /> Related Events ({incident.related_events.length})
          </h3>
          <div className="space-y-2">
            {incident.related_events.map((event) => (
              <div key={event.id} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-surface-light">
                <div className="min-w-0">
                  <p className="text-sm text-white">{event.message}</p>
                  <p className="text-xs text-text-muted mt-0.5">{event.source} · {formatDate(event.timestamp)}</p>
                </div>
                <SeverityBadge severity={event.severity} />
              </div>
            ))}
          </div>
        </div>

        {/* Related Jobs */}
        <div className="bg-surface rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-purple-400" /> Related Jobs ({incident.related_jobs.length})
          </h3>
          {incident.related_jobs.length === 0 ? (
            <p className="text-sm text-text-muted">No related jobs</p>
          ) : (
            <div className="space-y-2">
              {incident.related_jobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-surface-light">
                  <div className="min-w-0">
                    <p className="text-sm text-white">{job.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">{job.type.replace('_', ' ')} · {formatDate(job.created_at)}</p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TimelineEntry({ entry, isLast }: { entry: IncidentTimelineEntry; isLast: boolean }) {
  const Icon = TIMELINE_ICONS[entry.type] ?? Play;
  const severityColor = SEVERITY_COLORS[entry.severity];

  return (
    <div className={cn('relative flex gap-4 pb-6', isLast && 'pb-0')}>
      {/* Icon dot */}
      <div className={cn(
        'relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0',
        severityColor
      )}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 pt-1.5">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-medium text-white">{entry.title}</h4>
          <span className="text-xs text-text-muted whitespace-nowrap">
            {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
        <p className="text-sm text-text-muted mt-0.5">{entry.description}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={cn('text-xs px-2 py-0.5 rounded border', severityColor)}>{entry.severity}</span>
          <span className="text-xs text-text-muted bg-surface-lighter px-2 py-0.5 rounded">{entry.type}</span>
        </div>
      </div>
    </div>
  );
}
