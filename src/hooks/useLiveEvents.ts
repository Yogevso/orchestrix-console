import { useEffect, useRef, useState, useCallback } from 'react';
import type { SystemEvent, EventSeverity, EventType } from '@/types';

const SOURCES = ['orchestrix-core', 'syswatch', 'packet-analyzer', 'embedded-tester', 'api-gateway', 'identity-service'];
const EVENT_POOL: { type: EventType; severity: EventSeverity; message: string }[] = [
  { type: 'system', severity: 'info', message: 'Health check passed on all nodes' },
  { type: 'system', severity: 'warning', message: 'CPU usage elevated on worker-pool-2' },
  { type: 'system', severity: 'error', message: 'Disk I/O exceeding threshold' },
  { type: 'performance', severity: 'info', message: 'P99 latency within SLA bounds' },
  { type: 'performance', severity: 'warning', message: 'P99 latency approaching 500ms' },
  { type: 'application', severity: 'info', message: 'Cache warm-up completed' },
  { type: 'application', severity: 'error', message: 'Request timeout on /api/analytics' },
  { type: 'security', severity: 'warning', message: 'Rate limit triggered for 10.0.0.42' },
  { type: 'anomaly', severity: 'warning', message: 'Unusual traffic pattern detected' },
  { type: 'anomaly', severity: 'critical', message: 'Error rate anomaly — spike in 5xx responses' },
  { type: 'system', severity: 'info', message: 'Garbage collection completed in 45ms' },
  { type: 'performance', severity: 'error', message: 'Database query exceeded 10s timeout' },
];

function generateLiveEvent(): SystemEvent {
  const template = EVENT_POOL[Math.floor(Math.random() * EVENT_POOL.length)];
  return {
    id: crypto.randomUUID().slice(0, 8),
    type: template.type,
    severity: template.severity,
    source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
    message: template.message,
    timestamp: new Date().toISOString(),
    metadata: {},
  };
}

export function useLiveEvents(enabled = true, intervalMs = 4000, maxEvents = 100) {
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    if (intervalRef.current) return;
    setIsConnected(true);
    intervalRef.current = setInterval(() => {
      setEvents((prev) => {
        const next = [generateLiveEvent(), ...prev];
        return next.slice(0, maxEvents);
      });
    }, intervalMs);
  }, [intervalMs, maxEvents]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const clear = useCallback(() => {
    setEvents([]);
  }, []);

  useEffect(() => {
    if (enabled) start();
    return stop;
  }, [enabled, start, stop]);

  return { events, isConnected, start, stop, clear };
}
