import { clsx } from 'clsx';
import type { EventSeverity, JobStatus } from '@/types';

export function cn(...classes: (string | boolean | undefined | null)[]) {
  return clsx(classes);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function formatDateFull(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export const SEVERITY_COLORS: Record<EventSeverity, string> = {
  info: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  warning: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  error: 'text-red-400 bg-red-400/10 border-red-400/30',
  critical: 'text-red-300 bg-red-500/20 border-red-500/40',
};

export const STATUS_COLORS: Record<JobStatus, string> = {
  pending: 'text-gray-400 bg-gray-400/10 border-gray-400/30',
  running: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  completed: 'text-green-400 bg-green-400/10 border-green-400/30',
  failed: 'text-red-400 bg-red-400/10 border-red-400/30',
  cancelled: 'text-gray-500 bg-gray-500/10 border-gray-500/30',
  retrying: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
};
