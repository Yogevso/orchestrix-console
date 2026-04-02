import type {
  Job, SystemEvent, AuditLog, Incident, AnalyticsSummary,
  JobStatus, JobType, EventSeverity, EventType, AuditAction,
} from '@/types';

const rand = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randId = () => crypto.randomUUID().slice(0, 8);
const randDate = (daysBack: number) => {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return d.toISOString();
};

const JOB_NAMES = [
  'Sync user profiles', 'Generate monthly report', 'Cleanup stale sessions',
  'Send batch notifications', 'Analyze traffic patterns', 'Migrate legacy data',
  'Index search documents', 'Process payment queue', 'Aggregate metrics',
  'Backup database snapshot', 'Rebuild cache layer', 'Validate data integrity',
];
const SOURCES = ['orchestrix-core', 'syswatch', 'packet-analyzer', 'embedded-tester', 'api-gateway', 'identity-service'];
const EVENT_MESSAGES: Record<EventType, string[]> = {
  system: ['CPU usage exceeded 90%', 'Memory pressure detected', 'Disk I/O spike', 'Network latency increased'],
  application: ['Request timeout on /api/jobs', 'Database connection pool exhausted', 'Cache miss rate elevated'],
  security: ['Failed login attempt from 192.168.1.45', 'API key rotated', 'Suspicious request pattern detected'],
  performance: ['P99 latency above 500ms', 'Throughput dropped below threshold', 'GC pause exceeded 200ms'],
  anomaly: ['Unusual traffic spike detected', 'Error rate anomaly', 'Resource consumption anomaly'],
};

const USERS = ['admin', 'yogev', 'operator-1', 'ci-bot', 'sre-team'];

function generateJobs(count: number): Job[] {
  return Array.from({ length: count }, () => {
    const status = rand<JobStatus>(['pending', 'running', 'completed', 'failed', 'cancelled', 'retrying']);
    const createdAt = randDate(14);
    const startedAt = status !== 'pending' ? new Date(new Date(createdAt).getTime() + 5000).toISOString() : null;
    const completedAt = ['completed', 'failed', 'cancelled'].includes(status)
      ? new Date(new Date(createdAt).getTime() + Math.random() * 300000).toISOString() : null;
    return {
      id: randId(),
      name: rand(JOB_NAMES),
      type: rand<JobType>(['data_sync', 'report_generation', 'cleanup', 'notification', 'analysis', 'migration']),
      status,
      source: rand(SOURCES),
      created_at: createdAt,
      updated_at: completedAt || startedAt || createdAt,
      started_at: startedAt,
      completed_at: completedAt,
      retries: status === 'retrying' ? Math.floor(Math.random() * 3) + 1 : 0,
      max_retries: 3,
      error_message: status === 'failed' ? rand(['Timeout exceeded', 'Connection refused', 'Out of memory', 'Permission denied']) : null,
      metadata: { worker: rand(SOURCES), priority: rand(['low', 'medium', 'high']) },
    };
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

function generateEvents(count: number): SystemEvent[] {
  return Array.from({ length: count }, () => {
    const type = rand<EventType>(['system', 'application', 'security', 'performance', 'anomaly']);
    return {
      id: randId(),
      type,
      severity: rand<EventSeverity>(['info', 'warning', 'error', 'critical']),
      source: rand(SOURCES),
      message: rand(EVENT_MESSAGES[type]),
      timestamp: randDate(7),
      metadata: {},
    };
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function generateAuditLogs(count: number): AuditLog[] {
  return Array.from({ length: count }, () => ({
    id: randId(),
    user: rand(USERS),
    action: rand<AuditAction>(['login', 'logout', 'job_retry', 'job_cancel', 'config_change', 'user_create', 'incident_resolve']),
    target: rand(['job-' + randId(), 'config/alerts', 'user/' + rand(USERS), 'incident-' + randId()]),
    details: rand(['Triggered from dashboard', 'Automated action', 'Manual override', 'Scheduled task']),
    timestamp: randDate(30),
    ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
  })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function generateIncidents(): Incident[] {
  const events = generateEvents(8);
  const jobs = generateJobs(4);
  return [
    {
      id: 'inc-001',
      title: 'CPU Spike Cascading Failure',
      severity: 'critical',
      status: 'resolved',
      created_at: '2026-04-01T14:23:00Z',
      resolved_at: '2026-04-01T15:47:00Z',
      summary: 'A CPU spike on worker-pool-1 caused anomaly detection to trigger. The resulting analysis job failed due to resource exhaustion, was retried, and succeeded after the spike subsided.',
      timeline: [
        { id: '1', timestamp: '2026-04-01T14:23:00Z', type: 'event', title: 'CPU Usage Spike', description: 'CPU usage on worker-pool-1 exceeded 95%', severity: 'critical' },
        { id: '2', timestamp: '2026-04-01T14:24:12Z', type: 'alert', title: 'Anomaly Detected', description: 'Anomaly detection flagged unusual resource consumption pattern', severity: 'warning' },
        { id: '3', timestamp: '2026-04-01T14:25:30Z', type: 'job', title: 'Analysis Job Created', description: 'Automatic analysis job triggered to evaluate system state', severity: 'info' },
        { id: '4', timestamp: '2026-04-01T14:28:45Z', type: 'event', title: 'Memory Pressure', description: 'Memory usage crossed 85% threshold on worker-pool-1', severity: 'error' },
        { id: '5', timestamp: '2026-04-01T14:32:00Z', type: 'job', title: 'Analysis Job Failed', description: 'Job failed: Out of memory on worker-pool-1', severity: 'error' },
        { id: '6', timestamp: '2026-04-01T14:33:15Z', type: 'action', title: 'Auto-Retry Triggered', description: 'Job automatically retried (attempt 2/3)', severity: 'info' },
        { id: '7', timestamp: '2026-04-01T14:45:00Z', type: 'event', title: 'CPU Normalizing', description: 'CPU usage dropped to 60%', severity: 'info' },
        { id: '8', timestamp: '2026-04-01T14:52:00Z', type: 'job', title: 'Analysis Job Succeeded', description: 'Retry succeeded. System health confirmed stable.', severity: 'info' },
        { id: '9', timestamp: '2026-04-01T15:47:00Z', type: 'action', title: 'Incident Resolved', description: 'SRE team marked incident as resolved', severity: 'info' },
      ],
      related_events: events.slice(0, 5),
      related_jobs: jobs.slice(0, 3),
    },
    {
      id: 'inc-002',
      title: 'Database Connection Pool Exhaustion',
      severity: 'error',
      status: 'investigating',
      created_at: '2026-04-02T09:15:00Z',
      resolved_at: null,
      summary: 'Multiple services reported database connection failures. The connection pool was exhausted due to a long-running query from the report generation service.',
      timeline: [
        { id: '1', timestamp: '2026-04-02T09:15:00Z', type: 'event', title: 'Connection Pool Warning', description: 'Active connections reached 80% of pool limit', severity: 'warning' },
        { id: '2', timestamp: '2026-04-02T09:18:30Z', type: 'event', title: 'Pool Exhausted', description: 'All database connections in use, new requests queuing', severity: 'error' },
        { id: '3', timestamp: '2026-04-02T09:19:00Z', type: 'job', title: 'Report Generation Stalled', description: 'Monthly report job holding 15 connections', severity: 'error' },
        { id: '4', timestamp: '2026-04-02T09:20:45Z', type: 'alert', title: 'Service Degradation', description: 'API response times exceeding 5s SLA', severity: 'critical' },
        { id: '5', timestamp: '2026-04-02T09:22:00Z', type: 'action', title: 'Investigation Started', description: 'On-call engineer alerted and investigating', severity: 'info' },
      ],
      related_events: events.slice(2, 6),
      related_jobs: jobs.slice(1, 4),
    },
    {
      id: 'inc-003',
      title: 'Suspicious Login Pattern Detected',
      severity: 'warning',
      status: 'open',
      created_at: '2026-04-02T11:30:00Z',
      resolved_at: null,
      summary: 'Multiple failed login attempts detected from different IPs targeting the admin account. Security monitoring escalated the alert.',
      timeline: [
        { id: '1', timestamp: '2026-04-02T11:30:00Z', type: 'event', title: 'Failed Login Attempts', description: '5 failed login attempts for admin@orchestrix in 2 minutes', severity: 'warning' },
        { id: '2', timestamp: '2026-04-02T11:32:00Z', type: 'alert', title: 'Brute Force Detection', description: 'Security system flagged potential brute force attack', severity: 'error' },
        { id: '3', timestamp: '2026-04-02T11:33:00Z', type: 'action', title: 'Rate Limiting Applied', description: 'Automatic rate limiting enabled for affected IPs', severity: 'info' },
      ],
      related_events: events.slice(4, 7),
      related_jobs: [],
    },
  ];
}

function generateAnalytics(): AnalyticsSummary {
  const days = 14;
  const jobsOverTime = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - i - 1));
    const count = 20 + Math.floor(Math.random() * 40);
    const failed = Math.floor(Math.random() * 8);
    return { date: d.toISOString().slice(0, 10), count, failed };
  });

  return {
    total_jobs: jobsOverTime.reduce((s, d) => s + d.count, 0),
    failed_jobs: jobsOverTime.reduce((s, d) => s + d.failed, 0),
    success_rate: 92.4,
    total_events: 847,
    critical_events: 12,
    jobs_over_time: jobsOverTime,
    events_by_severity: [
      { severity: 'info', count: 412 },
      { severity: 'warning', count: 287 },
      { severity: 'error', count: 136 },
      { severity: 'critical', count: 12 },
    ],
    failure_rate_over_time: jobsOverTime.map((d) => ({
      date: d.date,
      rate: d.count > 0 ? Math.round((d.failed / d.count) * 100 * 10) / 10 : 0,
    })),
  };
}

// Pre-generate stable data
const MOCK_JOBS = generateJobs(50);
const MOCK_EVENTS = generateEvents(80);
const MOCK_AUDIT_LOGS = generateAuditLogs(40);
const MOCK_INCIDENTS = generateIncidents();
const MOCK_ANALYTICS = generateAnalytics();

export const mockData = {
  jobs: MOCK_JOBS,
  events: MOCK_EVENTS,
  auditLogs: MOCK_AUDIT_LOGS,
  incidents: MOCK_INCIDENTS,
  analytics: MOCK_ANALYTICS,
};
