import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import {
  LayoutDashboard, Briefcase, Radio, BarChart3,
  FileText, AlertTriangle, LogOut, Zap, Sun, Moon, Monitor,
  Server, GitBranch, Activity,
} from 'lucide-react';
import DesignPicker from '@/components/DesignPicker';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/workers', icon: Server, label: 'Workers' },
  { to: '/workflow-runs', icon: GitBranch, label: 'Workflows' },
  { to: '/events', icon: Radio, label: 'Events' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/audit-logs', icon: FileText, label: 'Audit Logs' },
  { to: '/incidents', icon: AlertTriangle, label: 'Incidents' },
  { to: '/telemetry', icon: Activity, label: 'Telemetry' },
];

const THEME_OPTIONS = [
  { value: 'dark' as const, icon: Moon, label: 'Dark' },
  { value: 'light' as const, icon: Sun, label: 'Light' },
  { value: 'system' as const, icon: Monitor, label: 'System' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="sidebar-panel w-64 bg-sidebar-bg border-r border-sidebar-border flex flex-col shrink-0" style={{ borderRadius: 0 }}>
        <div className="p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold text-white tracking-tight">Orchestrix</span>
          </div>
          <p className="text-xs text-text-muted mt-1">Operations Console</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm transition-all ${
                  isActive
                    ? 'bg-primary/15 text-primary-light font-medium glow-active'
                    : 'text-text-muted hover:text-text hover:bg-surface-light'
                }`
              }
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              <Icon className="w-4.5 h-4.5" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Theme toggle */}
        <div className="px-3 py-2 border-t border-sidebar-border">
          <div className="flex items-center justify-between bg-surface-light p-1" style={{ borderRadius: 'var(--radius-sm)' }}>
            {THEME_OPTIONS.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                title={label}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs transition-colors ${
                  theme === value
                    ? 'bg-primary/20 text-primary-light font-medium'
                    : 'text-text-muted hover:text-text'
                }`}
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Design preset picker */}
        <div className="px-3 py-2 border-t border-sidebar-border">
          <DesignPicker />
        </div>

        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center justify-between px-3 py-2">
            <div>
              <p className="text-sm font-medium text-white">{user?.username}</p>
              <p className="text-xs text-text-muted">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-surface-light transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-page-bg">
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
