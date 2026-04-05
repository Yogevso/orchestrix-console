/* REST client for system-insights-api — proxied through /insights. */

import axios from 'axios';
import type {
  HostMetricsResponse,
  ServiceMetricsResponse,
  PaginatedAlerts,
  TimelineResponse,
  InsightsStats,
} from '@/types/insights';

const insights = axios.create({
  baseURL: '/insights',
  headers: { 'Content-Type': 'application/json' },
});

// Reuse auth token from main client
insights.interceptors.request.use((config) => {
  const token = localStorage.getItem('orchestrix_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ── Host metrics ── */

export async function getHostMetrics(params?: {
  start_time?: string;
  end_time?: string;
}): Promise<HostMetricsResponse> {
  const { data } = await insights.get('/metrics/hosts', { params });
  return data;
}

/* ── Service metrics ── */

export async function getServiceMetrics(params?: {
  start_time?: string;
  end_time?: string;
}): Promise<ServiceMetricsResponse> {
  const { data } = await insights.get('/metrics/services', { params });
  return data;
}

/* ── Alerts ── */

export async function getInsightsAlerts(params?: {
  start_time?: string;
  end_time?: string;
  type?: string;
  source?: string;
  limit?: number;
  offset?: number;
}): Promise<PaginatedAlerts> {
  const { data } = await insights.get('/alerts', { params });
  return data;
}

/* ── Timeline ── */

export async function getTimeline(params?: {
  start_time?: string;
  end_time?: string;
  limit?: number;
  offset?: number;
}): Promise<TimelineResponse> {
  const { data } = await insights.get('/timeline', { params });
  return data;
}

/* ── Aggregate stats ── */

export async function getInsightsStats(params?: {
  start_time?: string;
  end_time?: string;
}): Promise<InsightsStats> {
  const { data } = await insights.get('/stats', { params });
  return data;
}
