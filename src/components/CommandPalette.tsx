import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Briefcase, Radio, BarChart3, FileText, AlertTriangle, LayoutDashboard, Command } from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords?: string[];
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const items: CommandItem[] = [
    { id: 'dashboard', label: 'Go to Dashboard', description: 'System overview', icon: LayoutDashboard, action: () => navigate('/'), keywords: ['home', 'overview'] },
    { id: 'jobs', label: 'Go to Jobs', description: 'Manage async workflows', icon: Briefcase, action: () => navigate('/jobs'), keywords: ['workflow', 'task', 'queue'] },
    { id: 'events', label: 'Go to Events', description: 'Live event feed', icon: Radio, action: () => navigate('/events'), keywords: ['alerts', 'logs', 'stream'] },
    { id: 'analytics', label: 'Go to Analytics', description: 'Charts and insights', icon: BarChart3, action: () => navigate('/analytics'), keywords: ['charts', 'metrics', 'graphs'] },
    { id: 'audit', label: 'Go to Audit Logs', description: 'User and system actions', icon: FileText, action: () => navigate('/audit-logs'), keywords: ['history', 'actions'] },
    { id: 'incidents', label: 'Go to Incidents', description: 'Investigate correlated events', icon: AlertTriangle, action: () => navigate('/incidents'), keywords: ['debug', 'investigate', 'timeline'] },
  ];

  const filtered = query
    ? items.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.label.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.keywords?.some((k) => k.includes(q))
        );
      })
    : items;

  const execute = useCallback((item: CommandItem) => {
    item.action();
    setOpen(false);
    setQuery('');
  }, []);

  // Keyboard shortcut to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setSelectedIndex(0);
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Reset selection on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      execute(filtered[selectedIndex]);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />

      {/* Palette */}
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-xl shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-4.5 h-4.5 text-text-muted shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands..."
            className="flex-1 bg-transparent text-sm text-white placeholder-text-muted/50 outline-none"
          />
          <kbd className="text-[10px] text-text-muted bg-surface-light border border-border rounded px-1.5 py-0.5 font-mono">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 && (
            <p className="text-sm text-text-muted text-center py-8">No results found</p>
          )}
          {filtered.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => execute(item)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  i === selectedIndex ? 'bg-primary/15 text-primary-light' : 'text-text hover:bg-surface-light'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.label}</p>
                  {item.description && <p className="text-xs text-text-muted">{item.description}</p>}
                </div>
                {i === selectedIndex && (
                  <kbd className="text-[10px] text-text-muted bg-surface-light border border-border rounded px-1.5 py-0.5 font-mono">↵</kbd>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border text-[10px] text-text-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><kbd className="bg-surface-light border border-border rounded px-1 py-0.5 font-mono">↑↓</kbd> navigate</span>
            <span className="flex items-center gap-1"><kbd className="bg-surface-light border border-border rounded px-1 py-0.5 font-mono">↵</kbd> select</span>
          </div>
          <span className="flex items-center gap-1"><Command className="w-3 h-3" />K to toggle</span>
        </div>
      </div>
    </div>
  );
}
