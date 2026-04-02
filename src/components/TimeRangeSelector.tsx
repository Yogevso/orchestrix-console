import { Clock } from 'lucide-react';

export type TimeRange = '5m' | '15m' | '1h' | '6h' | '24h' | '7d' | '14d' | 'all';

const RANGES: { value: TimeRange; label: string }[] = [
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
  { value: '1h', label: '1h' },
  { value: '6h', label: '6h' },
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '14d', label: '14d' },
  { value: 'all', label: 'All' },
];

export function timeRangeToMs(range: TimeRange): number | null {
  const map: Record<TimeRange, number | null> = {
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '14d': 14 * 24 * 60 * 60 * 1000,
    'all': null,
  };
  return map[range];
}

export function filterByTimeRange<T>(items: T[], range: TimeRange, getTimestamp: (item: T) => string): T[] {
  const ms = timeRangeToMs(range);
  if (!ms) return items;
  const cutoff = Date.now() - ms;
  return items.filter((item) => new Date(getTimestamp(item)).getTime() >= cutoff);
}

export function TimeRangeSelector({ value, onChange }: { value: TimeRange; onChange: (range: TimeRange) => void }) {
  return (
    <div className="flex items-center gap-1 bg-surface-light border border-border rounded-lg p-0.5">
      <Clock className="w-3.5 h-3.5 text-text-muted ml-2 mr-1 shrink-0" />
      {RANGES.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
            value === range.value
              ? 'bg-primary/20 text-primary-light'
              : 'text-text-muted hover:text-text'
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}
