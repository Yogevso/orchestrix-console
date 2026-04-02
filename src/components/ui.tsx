import type { EventSeverity, JobStatus } from '@/types';
import { cn, SEVERITY_COLORS, STATUS_COLORS } from '@/utils';

export function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', STATUS_COLORS[status])}>
      <span className={cn(
        'w-1.5 h-1.5 rounded-full',
        status === 'pending' && 'bg-gray-400',
        status === 'running' && 'bg-blue-400 animate-pulse',
        status === 'completed' && 'bg-green-400',
        status === 'failed' && 'bg-red-400',
        status === 'cancelled' && 'bg-gray-500',
        status === 'retrying' && 'bg-yellow-400 animate-pulse',
      )} />
      {status}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: EventSeverity }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', SEVERITY_COLORS[severity])}>
      {severity}
    </span>
  );
}

export function SummaryCard({ title, value, subtitle, color = 'text-white' }: {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}) {
  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <p className="text-sm text-text-muted mb-1">{title}</p>
      <p className={cn('text-3xl font-bold', color)}>{value}</p>
      {subtitle && <p className="text-xs text-text-muted mt-1">{subtitle}</p>}
    </div>
  );
}

export function PageHeader({ title, subtitle, children }: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-text-muted mt-1">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}

export function FilterSelect({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-text-muted whitespace-nowrap">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-surface-light border border-border rounded-lg px-3 py-1.5 text-sm text-text focus:outline-none focus:border-primary"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Icon className="w-12 h-12 text-text-muted/40 mb-4" />
      <h3 className="text-lg font-medium text-text-muted mb-1">{title}</h3>
      <p className="text-sm text-text-muted/60">{description}</p>
    </div>
  );
}

export function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 max-w-md">
        <p className="text-red-400 font-medium mb-2">Something went wrong</p>
        <p className="text-sm text-text-muted mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
