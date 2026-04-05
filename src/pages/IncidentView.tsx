import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchIncidents, fetchIncident, analyzeIncident } from '@/api/endpoints';
import { PageHeader, SeverityBadge, StatusBadge, LoadingSpinner, EmptyState } from '@/components/ui';
import { formatDate, formatDateFull, cn, SEVERITY_COLORS } from '@/utils';
import { AlertTriangle, Clock, ArrowRight, Briefcase, Radio, Zap, ChevronRight, Play, Sparkles, X, Brain, Target, ListOrdered, Footprints, Link, Wrench, Server, Activity, Cpu } from 'lucide-react';
import type { Incident, IncidentTimelineEntry } from '@/types';
import { usePageTitle } from '@/hooks/usePageTitle';
import { fetchHostMetrics } from '@/services/insightsApi';

function SourceChip({ source }: { source: string }) {
  const styles: Record<string, string> = {
    engine: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    insights: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    ai: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  };
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium uppercase tracking-wider ${styles[source] ?? 'text-text-muted border-border'}`}>
      {source}
    </span>
  );
}

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
                      <div className="flex items-center gap-1 ml-auto">
                        {inc.related_jobs.length > 0 && <SourceChip source="engine" />}
                        {inc.related_events.length > 0 && <SourceChip source="insights" />}
                        <SourceChip source="ai" />
                      </div>
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
  const [showAnalysis, setShowAnalysis] = useState(false);
  const { mutate: explain, data: analysis, isPending } = useMutation({
    mutationFn: analyzeIncident,
  });

  if (!incident) return <LoadingSpinner />;

  const handleExplain = () => {
    setShowAnalysis(true);
    if (!analysis) explain(incident);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-white transition-colors">
          <ArrowRight className="w-4 h-4 rotate-180" /> Back to Incidents
        </button>
        <button
          onClick={handleExplain}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 text-primary-light border border-primary/30 hover:bg-primary/30 hover:border-primary/50 transition-all font-medium text-sm"
        >
          <Sparkles className="w-4 h-4" />
          Explain Incident
        </button>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Related Events */}
        <div className="bg-surface rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-400" /> Related Events ({incident.related_events.length}) <SourceChip source="engine" />
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
            <Briefcase className="w-4 h-4 text-purple-400" /> Related Jobs ({incident.related_jobs.length}) <SourceChip source="engine" />
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

      {/* Telemetry Context */}
      <TelemetryContext />

      {/* AI Analysis Panel */}
      {showAnalysis && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAnalysis(false)} />
          <div className="relative w-full max-w-lg bg-surface border-l border-border shadow-2xl overflow-y-auto animate-in slide-in-from-right">
            <div className="sticky top-0 bg-surface border-b border-border p-5 flex items-center justify-between z-10">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" /> AI Incident Analysis
              </h3>
              <button onClick={() => setShowAnalysis(false)} className="p-1.5 rounded-lg hover:bg-surface-light text-text-muted hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {isPending ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-sm text-text-muted">Analyzing incident...</p>
                </div>
              ) : analysis ? (
                <>
                  {/* Source + Type badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn(
                      'text-xs px-2.5 py-1 rounded-full border font-medium',
                      analysis.source === 'ai' ? 'text-purple-400 bg-purple-400/10 border-purple-400/30' : 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30'
                    )}>
                      {analysis.source === 'ai' ? '🤖 AI-powered' : '⚙️ Rule-based'}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full border text-text-muted bg-surface-lighter border-border font-medium">
                      {analysis.incident_type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-text-muted ml-auto">
                      prompt {analysis.prompt_version}
                    </span>
                  </div>

                  {/* Quality Scores */}
                  <div className="grid grid-cols-3 gap-3">
                    <QualityGauge label="Confidence" value={analysis.quality.confidence} />
                    <QualityGauge label="Signal" value={analysis.quality.signal_strength} />
                    <QualityGauge label="Coverage" value={analysis.quality.data_coverage} />
                  </div>

                  {/* Summary */}
                  <AnalysisSection icon={Sparkles} title="Summary" color="text-blue-400">
                    <p className="text-sm text-text leading-relaxed">{analysis.summary}</p>
                  </AnalysisSection>

                  {/* Root Cause */}
                  <AnalysisSection icon={Target} title="Root Cause" color="text-red-400">
                    <p className="text-sm text-text leading-relaxed">{analysis.root_cause}</p>
                  </AnalysisSection>

                  {/* Recommended Action */}
                  <AnalysisSection icon={Wrench} title="Recommended Action" color="text-green-400">
                    <p className="text-sm text-text leading-relaxed">{analysis.recommended_action}</p>
                  </AnalysisSection>

                  {/* Correlations */}
                  {analysis.correlations.length > 0 && (
                    <AnalysisSection icon={Link} title="Correlations" color="text-orange-400">
                      <div className="space-y-3">
                        {analysis.correlations.map((c, i) => (
                          <div key={i} className="p-3 rounded-lg bg-surface border border-border">
                            <p className="text-sm text-text leading-relaxed">{c.pattern}</p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {c.sources.map((s) => (
                                <span key={s} className="text-xs px-2 py-0.5 rounded bg-surface-lighter text-text-muted">{s}</span>
                              ))}
                              <SeverityBadge severity={c.severity as 'info' | 'warning' | 'error' | 'critical'} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </AnalysisSection>
                  )}

                  {/* Timeline */}
                  <AnalysisSection icon={ListOrdered} title="AI Timeline" color="text-yellow-400">
                    <ol className="space-y-2">
                      {analysis.timeline.map((step, i) => (
                        <li key={i} className="flex gap-2 text-sm text-text">
                          <span className="text-text-muted shrink-0">{i + 1}.</span>
                          <div className="flex-1">
                            <span className="leading-relaxed">{step.event}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-text-muted">{new Date(step.timestamp).toLocaleTimeString()}</span>
                              <span className={cn(
                                'text-xs px-1.5 py-0.5 rounded border',
                                SEVERITY_COLORS[step.severity as keyof typeof SEVERITY_COLORS] ?? 'text-text-muted border-border'
                              )}>{step.severity}</span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </AnalysisSection>

                  {/* Reasoning Steps */}
                  <AnalysisSection icon={Footprints} title="Reasoning Steps" color="text-purple-400">
                    <ul className="space-y-2">
                      {analysis.reasoning_steps.map((step, i) => (
                        <li key={i} className="flex gap-2 text-sm text-text">
                          <span className="text-primary mt-1 shrink-0">→</span>
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </AnalysisSection>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QualityGauge({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="p-3 rounded-lg bg-surface-light border border-border text-center">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <div className="h-1.5 rounded-full bg-surface-lighter overflow-hidden mb-1.5">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            value >= 0.8 ? 'bg-green-400' : value >= 0.6 ? 'bg-yellow-400' : 'bg-red-400'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-white">{pct}%</span>
    </div>
  );
}

function AnalysisSection({ icon: Icon, title, color, children }: { icon: typeof Clock; title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-light rounded-lg border border-border p-4">
      <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <Icon className={cn('w-4 h-4', color)} /> {title}
      </h4>
      {children}
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

function TelemetryContext() {
  const { data } = useQuery({ queryKey: ['insights-hosts-incident'], queryFn: fetchHostMetrics, retry: false });
  const hosts = data?.hosts ?? [];
  if (hosts.length === 0) return null;

  return (
    <div className="bg-surface rounded-xl border border-border p-5 mb-6">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <Cpu className="w-4 h-4 text-emerald-400" /> System Telemetry Context <SourceChip source="insights" />
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {hosts.slice(0, 6).map((host) => (
          <div key={host.hostname} className="p-3 rounded-lg bg-surface-light flex items-center justify-between">
            <div>
              <p className="text-sm text-white font-medium">{host.hostname}</p>
              <p className="text-xs text-text-muted">{host.process_count} processes</p>
            </div>
            <div className="text-right">
              <p className={`text-xs font-medium ${(host.avg_cpu ?? 0) > 80 ? 'text-red-400' : 'text-text-muted'}`}>CPU {(host.avg_cpu ?? 0).toFixed(0)}%</p>
              <p className={`text-xs font-medium ${(host.avg_memory ?? 0) > 80 ? 'text-red-400' : 'text-text-muted'}`}>MEM {(host.avg_memory ?? 0).toFixed(0)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
