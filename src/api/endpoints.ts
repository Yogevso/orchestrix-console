import type {
  AuthCredentials, AuthResponse, Job, SystemEvent,
  AuditLog, Incident, AnalyticsSummary, PaginatedResponse,
  JobStatus, JobType, EventSeverity, EventType, AuditAction,
} from '@/types';
import { mockData } from './mock-data';

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
