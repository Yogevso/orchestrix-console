// ── Engine Types ──
// TypeScript interfaces matching Orchestrix Engine Pydantic schemas

export type EngineJobStatus = 'QUEUED' | 'LEASED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'DEAD_LETTER' | 'CANCELLED';
export type EngineWorkerStatus = 'ONLINE' | 'OFFLINE' | 'DRAINING';
export type EngineWorkflowStatus = 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED' | 'PAUSED';
export type EngineStepStatus = 'PENDING' | 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'SKIPPED' | 'CANCELLED';
export type EngineEventType =
  | 'CREATED' | 'QUEUED' | 'LEASED' | 'RUNNING' | 'HEARTBEAT'
  | 'SUCCEEDED' | 'FAILED' | 'RETRIED' | 'DEAD_LETTERED' | 'CANCELLED' | 'REQUEUED';

export interface EngineJob {
  id: string;
  type: string;
  queue_name: string;
  priority: number;
  payload: Record<string, unknown>;
  status: EngineJobStatus;
  attempts: number;
  max_attempts: number;
  last_error: string | null;
  scheduled_at: string | null;
  available_at: string;
  lease_expires_at: string | null;
  worker_id: string | null;
  idempotency_key: string | null;
  tenant_id: string | null;
  workflow_step_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface EngineJobList {
  jobs: EngineJob[];
  total: number;
}

export interface EngineJobEvent {
  id: string;
  job_id: string;
  event_type: EngineEventType;
  message: string | null;
  metadata_: Record<string, unknown> | null;
  created_at: string;
}

export interface EngineEventList {
  events: EngineJobEvent[];
  total: number;
}

export interface EngineWorker {
  id: string;
  name: string;
  queues: string[];
  capabilities: string[];
  max_concurrency: number;
  last_heartbeat_at: string | null;
  status: EngineWorkerStatus;
  running_count: number;
  created_at: string;
}

export interface EngineQueueStats {
  queue_name: string;
  queued: number;
  leased: number;
  running: number;
  succeeded: number;
  failed: number;
  dead_letter: number;
}

export interface EngineWorkflow {
  id: string;
  name: string;
  description: string | null;
  definition: Record<string, unknown>;
  tenant_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface EngineWorkflowStep {
  id: string;
  workflow_run_id: string;
  step_name: string;
  job_type: string;
  payload: Record<string, unknown>;
  depends_on: string[];
  status: EngineStepStatus;
  attempts: number;
  max_attempts: number;
  last_error: string | null;
  result: Record<string, unknown> | null;
  job_id: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
}

export interface EngineWorkflowRun {
  id: string;
  workflow_id: string;
  status: EngineWorkflowStatus;
  input_payload: Record<string, unknown>;
  output: Record<string, unknown> | null;
  tenant_id: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
  steps: EngineWorkflowStep[];
}

export interface EngineRecurringJob {
  id: string;
  name: string;
  type: string;
  payload: Record<string, unknown>;
  queue_name: string;
  cron_expression: string;
  max_attempts: number;
  enabled: boolean;
  tenant_id: string | null;
  last_run_at: string | null;
  next_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EngineQueueConfig {
  id: string;
  queue_name: string;
  max_concurrency: number | null;
  rate_limit_per_second: number | null;
  created_at: string;
  updated_at: string;
}

// WebSocket message from Engine
export interface EngineWsMessage {
  topic: 'job.update' | 'workflow.update' | 'worker.update';
  data: Record<string, unknown>;
}
