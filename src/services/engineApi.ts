/**
 * Orchestrix Engine REST API client.
 *
 * All calls go through the existing axios instance which handles
 * auth tokens and 401 redirects automatically via /api proxy.
 */
import api from '@/api/client';
import type {
  EngineJob,
  EngineJobList,
  EngineJobEvent,
  EngineEventList,
  EngineWorker,
  EngineQueueStats,
  EngineWorkflow,
  EngineWorkflowRun,
  EngineRecurringJob,
  EngineQueueConfig,
  EngineJobStatus,
  EngineEventType,
  EngineWorkflowStatus,
} from '@/types/engine';

// ── Jobs ──

export async function getJobs(params?: {
  status?: EngineJobStatus;
  queue_name?: string;
  tenant_id?: string;
  type?: string;
  limit?: number;
  offset?: number;
}): Promise<EngineJobList> {
  const { data } = await api.get<EngineJobList>('/jobs', { params });
  return data;
}

export async function getJob(id: string): Promise<EngineJob> {
  const { data } = await api.get<EngineJob>(`/jobs/${id}`);
  return data;
}

export async function getJobEvents(jobId: string): Promise<EngineJobEvent[]> {
  const { data } = await api.get<EngineJobEvent[]>(`/jobs/${jobId}/events`);
  return data;
}

export async function createJob(body: {
  type: string;
  payload?: Record<string, unknown>;
  queue_name?: string;
  priority?: number;
  max_attempts?: number;
  tenant_id?: string;
}): Promise<EngineJob> {
  const { data } = await api.post<EngineJob>('/jobs', body);
  return data;
}

export async function cancelEngineJob(id: string): Promise<EngineJob> {
  const { data } = await api.post<EngineJob>(`/jobs/${id}/cancel`);
  return data;
}

export async function requeueJob(id: string): Promise<EngineJob> {
  const { data } = await api.post<EngineJob>(`/jobs/${id}/requeue`);
  return data;
}

export async function getQueueStats(): Promise<EngineQueueStats[]> {
  const { data } = await api.get<EngineQueueStats[]>('/jobs/stats');
  return data;
}

// ── Events (cross-job) ──

export async function getEvents(params?: {
  since?: string;
  event_type?: EngineEventType;
  limit?: number;
  offset?: number;
}): Promise<EngineEventList> {
  const { data } = await api.get<EngineEventList>('/events', { params });
  return data;
}

// ── Workers ──

export async function getWorkers(): Promise<EngineWorker[]> {
  const { data } = await api.get<EngineWorker[]>('/workers');
  return data;
}

// ── Workflows ──

export async function getWorkflows(): Promise<EngineWorkflow[]> {
  const { data } = await api.get<EngineWorkflow[]>('/workflows');
  return data;
}

export async function getWorkflow(id: string): Promise<EngineWorkflow> {
  const { data } = await api.get<EngineWorkflow>(`/workflows/${id}`);
  return data;
}

export async function createWorkflow(body: {
  name: string;
  description?: string;
  steps: { name: string; job_type: string; payload?: Record<string, unknown>; depends_on?: string[]; max_attempts?: number }[];
  tenant_id?: string;
}): Promise<EngineWorkflow> {
  const { data } = await api.post<EngineWorkflow>('/workflows', body);
  return data;
}

export async function getWorkflowRuns(params?: {
  workflow_id?: string;
  status?: EngineWorkflowStatus;
  tenant_id?: string;
  limit?: number;
  offset?: number;
}): Promise<EngineWorkflowRun[]> {
  const { data } = await api.get<EngineWorkflowRun[]>('/workflows/runs', { params });
  return data;
}

export async function getWorkflowRun(runId: string): Promise<EngineWorkflowRun> {
  const { data } = await api.get<EngineWorkflowRun>(`/workflows/runs/${runId}`);
  return data;
}

export async function startWorkflowRun(body: {
  workflow_id: string;
  input_payload?: Record<string, unknown>;
  tenant_id?: string;
}): Promise<EngineWorkflowRun> {
  const { data } = await api.post<EngineWorkflowRun>('/workflows/runs', body);
  return data;
}

export async function cancelWorkflowRun(runId: string): Promise<EngineWorkflowRun> {
  const { data } = await api.post<EngineWorkflowRun>(`/workflows/runs/${runId}/cancel`);
  return data;
}

export async function pauseWorkflowRun(runId: string): Promise<EngineWorkflowRun> {
  const { data } = await api.post<EngineWorkflowRun>(`/workflows/runs/${runId}/pause`);
  return data;
}

export async function resumeWorkflowRun(runId: string): Promise<EngineWorkflowRun> {
  const { data } = await api.post<EngineWorkflowRun>(`/workflows/runs/${runId}/resume`);
  return data;
}

export async function retryWorkflowStep(stepId: string): Promise<{ id: string }> {
  const { data } = await api.post(`/workflows/steps/${stepId}/retry`);
  return data;
}

// ── Recurring Jobs ──

export async function getRecurringJobs(): Promise<EngineRecurringJob[]> {
  const { data } = await api.get<EngineRecurringJob[]>('/recurring');
  return data;
}

export async function createRecurringJob(body: {
  name: string;
  type: string;
  payload?: Record<string, unknown>;
  queue_name?: string;
  cron_expression: string;
  max_attempts?: number;
  tenant_id?: string;
}): Promise<EngineRecurringJob> {
  const { data } = await api.post<EngineRecurringJob>('/recurring', body);
  return data;
}

export async function toggleRecurringJob(id: string, enabled: boolean): Promise<EngineRecurringJob> {
  const { data } = await api.patch<EngineRecurringJob>(`/recurring/${id}`, { enabled });
  return data;
}

export async function deleteRecurringJob(id: string): Promise<void> {
  await api.delete(`/recurring/${id}`);
}

// ── Queue Config ──

export async function getQueueConfigs(): Promise<EngineQueueConfig[]> {
  const { data } = await api.get<EngineQueueConfig[]>('/queues');
  return data;
}

export async function upsertQueueConfig(
  queueName: string,
  body: { max_concurrency?: number; rate_limit_per_second?: number },
): Promise<EngineQueueConfig> {
  const { data } = await api.put<EngineQueueConfig>(`/queues/${queueName}`, {
    queue_name: queueName,
    ...body,
  });
  return data;
}

// ── Metrics ──

export async function getMetrics(): Promise<string> {
  const { data } = await api.get<string>('/metrics');
  return data;
}
