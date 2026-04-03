import type {
  AuthCredentials, AuthResponse, Job, SystemEvent,
  AuditLog, Incident, AnalyticsSummary, PaginatedResponse,
  JobStatus, JobType, EventSeverity, EventType, AuditAction,
  IncidentAnalysis,
} from '@/types';
import { mockData } from './mock-data';
import axios from 'axios';

// Simulate network latency
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms + Math.random() * 200));

// ─── Auth ──────────────────────────────────────────────
export async function login(creds: AuthCredentials): Promise<AuthResponse> {
  await delay(500);
  if (creds.username === 'admin' && creds.password === 'admin') {
    return {
      access_token: 'mock-jwt-' + Date.now(),
      token_type: 'bearer',
      user: { id: 'u-001', username: 'admin', role: 'admin' },
    };
  }
  throw new Error('Invalid credentials');
}

// ─── Jobs ──────────────────────────────────────────────
export async function fetchJobs(params?: {
  status?: JobStatus;
  type?: JobType;
  source?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<Job>> {
  await delay();
  let jobs = [...mockData.jobs];
  if (params?.status) jobs = jobs.filter((j) => j.status === params.status);
  if (params?.type) jobs = jobs.filter((j) => j.type === params.type);
  if (params?.source) jobs = jobs.filter((j) => j.source === params.source);
  const page = params?.page ?? 1;
  const perPage = params?.per_page ?? 15;
  const start = (page - 1) * perPage;
  return { items: jobs.slice(start, start + perPage), total: jobs.length, page, per_page: perPage };
}

export async function fetchJob(id: string): Promise<Job> {
  await delay();
  const job = mockData.jobs.find((j) => j.id === id);
  if (!job) throw new Error('Job not found');
  return job;
}

export async function retryJob(id: string): Promise<Job> {
  await delay(400);
  const job = mockData.jobs.find((j) => j.id === id);
  if (!job) throw new Error('Job not found');
  return { ...job, status: 'retrying', retries: job.retries + 1, updated_at: new Date().toISOString() };
}

export async function cancelJob(id: string): Promise<Job> {
  await delay(400);
  const job = mockData.jobs.find((j) => j.id === id);
  if (!job) throw new Error('Job not found');
  return { ...job, status: 'cancelled', updated_at: new Date().toISOString() };
}

// ─── Events ────────────────────────────────────────────
export async function fetchEvents(params?: {
  severity?: EventSeverity;
  type?: EventType;
  source?: string;
}): Promise<SystemEvent[]> {
  await delay();
  let events = [...mockData.events];
  if (params?.severity) events = events.filter((e) => e.severity === params.severity);
  if (params?.type) events = events.filter((e) => e.type === params.type);
  if (params?.source) events = events.filter((e) => e.source === params.source);
  return events;
}

// ─── Audit Logs ────────────────────────────────────────
export async function fetchAuditLogs(params?: {
  user?: string;
  action?: AuditAction;
}): Promise<AuditLog[]> {
  await delay();
  let logs = [...mockData.auditLogs];
  if (params?.user) logs = logs.filter((l) => l.user === params.user);
  if (params?.action) logs = logs.filter((l) => l.action === params.action);
  return logs;
}

// ─── Analytics ─────────────────────────────────────────
export async function fetchAnalytics(): Promise<AnalyticsSummary> {
  await delay(500);
  return mockData.analytics;
}

// ─── Incidents ─────────────────────────────────────────
export async function fetchIncidents(): Promise<Incident[]> {
  await delay();
  return mockData.incidents;
}

export async function fetchIncident(id: string): Promise<Incident> {
  await delay();
  const incident = mockData.incidents.find((i) => i.id === id);
  if (!incident) throw new Error('Incident not found');
  return incident;
}

// ─── AI Analysis (Orchestrix AI) ───────────────────────
export async function analyzeIncident(incident: Incident): Promise<IncidentAnalysis> {
  try {
    const res = await axios.post<IncidentAnalysis>('/ai/analyze-incident', {
      incident_id: incident.id,
      time_range: 'last_10_minutes',
    });
    return res.data;
  } catch {
    // Fallback: mock AI response for demo mode (when orchestrix-ai is not running)
    await delay(1500);
    return generateMockAnalysis(incident);
  }
}

function generateMockAnalysis(incident: Incident): IncidentAnalysis {
  const criticalEvents = incident.related_events.filter((e) => e.severity === 'critical' || e.severity === 'error');
  const failedJobs = incident.related_jobs.filter((j) => j.status === 'failed');
  const sources = [...new Set(incident.related_events.map((e) => e.source))];

  return {
    incident_id: incident.id,
    incident_type: criticalEvents.length > 0 ? 'cascading_failure' : 'system_degradation',
    summary: `AI analysis of "${incident.title}": This ${incident.severity}-severity incident involved ${incident.timeline.length} timeline events, ${criticalEvents.length} critical/error events, and ${failedJobs.length} failed job(s). The incident is currently ${incident.status}.`,
    root_cause: criticalEvents.length > 0
      ? `Root cause traced to: "${criticalEvents[0].message}" from ${criticalEvents[0].source}. This triggered a cascade of ${incident.timeline.length - 1} subsequent events.`
      : `System degradation detected across ${incident.related_events.length} events. No single root cause identified — likely a compound failure involving ${sources.join(', ')}.`,
    reasoning_steps: [
      `Analyzed ${incident.timeline.length} timeline entries spanning the incident window`,
      `Identified ${criticalEvents.length} critical/error events as primary signals`,
      `Correlated ${failedJobs.length} failed jobs with event timestamps`,
      `Evaluated severity escalation pattern: ${[...new Set(incident.timeline.map((t) => t.severity))].join(' → ')}`,
      `Confidence weighted by event correlation strength and timeline consistency`,
    ],
    correlations: sources.length > 1 ? [{
      sources,
      pattern: `Cross-source signals detected across ${sources.join(', ')} — possible cascading failure`,
      severity: incident.severity,
    }] : [],
    timeline: incident.timeline.map((t) => ({
      timestamp: t.timestamp,
      event: `${t.title} — ${t.description}`,
      severity: t.severity,
    })),
    recommended_action: criticalEvents.length > 0
      ? `Investigate ${criticalEvents[0].source} for the root cause event. Review related job retries and consider scaling or rollback.`
      : `Monitor system metrics across ${sources.join(', ')}. Consider increasing alert sensitivity for early detection.`,
    quality: {
      confidence: criticalEvents.length > 0 ? 0.85 : 0.62,
      signal_strength: Math.min(1, criticalEvents.length * 0.3 + 0.4),
      data_coverage: Math.min(1, (incident.related_events.length + incident.related_jobs.length) / 10),
    },
    source: 'rule-based',
    prompt_version: 'v1.2-mock',
  };
}
