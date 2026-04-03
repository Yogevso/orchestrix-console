export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'retrying';
export type JobType = 'data_sync' | 'report_generation' | 'cleanup' | 'notification' | 'analysis' | 'migration';
export type EventSeverity = 'info' | 'warning' | 'error' | 'critical';
export type EventType = 'system' | 'application' | 'security' | 'performance' | 'anomaly';
export type AuditAction = 'login' | 'logout' | 'job_retry' | 'job_cancel' | 'config_change' | 'user_create' | 'incident_resolve';

export interface Job {
  id: string;
  name: string;
  type: JobType;
  status: JobStatus;
  source: string;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
  retries: number;
  max_retries: number;
  error_message: string | null;
  metadata: Record<string, unknown>;
}

export interface SystemEvent {
  id: string;
  type: EventType;
  severity: EventSeverity;
  source: string;
  message: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface AuditLog {
  id: string;
  user: string;
  action: AuditAction;
  target: string;
  details: string;
  timestamp: string;
  ip_address: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: EventSeverity;
  status: 'open' | 'investigating' | 'resolved';
  created_at: string;
  resolved_at: string | null;
  summary: string;
  timeline: IncidentTimelineEntry[];
  related_events: SystemEvent[];
  related_jobs: Job[];
}

export interface IncidentTimelineEntry {
  id: string;
  timestamp: string;
  type: 'event' | 'job' | 'alert' | 'action';
  title: string;
  description: string;
  severity: EventSeverity;
}

export interface AnalyticsSummary {
  total_jobs: number;
  failed_jobs: number;
  success_rate: number;
  total_events: number;
  critical_events: number;
  jobs_over_time: { date: string; count: number; failed: number }[];
  events_by_severity: { severity: string; count: number }[];
  failure_rate_over_time: { date: string; rate: number }[];
}

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: { id: string; username: string; role: string };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface IncidentAnalysis {
  incident_id: string;
  incident_type: string;
  summary: string;
  root_cause: string;
  reasoning_steps: string[];
  correlations: {
    sources: string[];
    pattern: string;
    severity: string;
  }[];
  timeline: {
    timestamp: string;
    event: string;
    severity: string;
  }[];
  recommended_action: string;
  quality: {
    confidence: number;
    signal_strength: number;
    data_coverage: number;
  };
  source: 'ai' | 'rule-based';
  prompt_version: string;
}
