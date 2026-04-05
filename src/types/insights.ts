/* Types matching system-insights-api response schemas. */

export interface HostMetrics {
  source: string;
  process_count: number;
  avg_cpu: number;
  peak_cpu: number;
  avg_mem_kb: number;
  peak_mem_kb: number;
  connection_count: number;
  alert_count: number;
}

export interface HostMetricsResponse {
  hosts: HostMetrics[];
  total: number;
}

export interface ServiceMetrics {
  name: string;
  instance_count: number;
  avg_cpu: number;
  peak_cpu: number;
  avg_mem_kb: number;
  peak_mem_kb: number;
}

export interface ServiceMetricsResponse {
  services: ServiceMetrics[];
  total: number;
}

export interface InsightsAlert {
  id: number;
  timestamp: string;
  type: string;
  message: string;
  source: string | null;
  batch_id: string | null;
}

export interface PaginatedAlerts {
  data: InsightsAlert[];
  total: number;
  limit: number;
  offset: number;
}

export interface TimelineEvent {
  id: number;
  timestamp: string;
  event_type: 'process' | 'connection' | 'alert';
  summary: string;
  source: string | null;
  batch_id: string | null;
}

export interface TimelineResponse {
  data: TimelineEvent[];
  total: number;
  limit: number;
  offset: number;
}

export interface InsightsStats {
  processes: {
    total_records: number;
    unique_processes: number;
    avg_cpu: number;
    peak_cpu: number;
    peak_cpu_process: string | null;
    avg_mem_kb: number;
    peak_mem_kb: number;
  };
  connections: {
    total_records: number;
    protocols: Record<string, number>;
    unique_local_ports: number;
    unique_remote_ports: number;
  };
  alerts: {
    total_count: number;
    by_type: Record<string, number>;
  };
  time_range: {
    start: string | null;
    end: string | null;
  };
}
