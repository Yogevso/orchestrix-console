import { useState, useCallback, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '@/hooks/useAuth';
import { ThemeProvider } from '@/hooks/useTheme';
import { ToastProvider } from '@/hooks/useToast';
import AppLayout from '@/components/AppLayout';
import CommandPalette from '@/components/CommandPalette';
import { LoadingSpinner } from '@/components/ui';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';

const Jobs = lazy(() => import('@/pages/Jobs'));
const JobDetails = lazy(() => import('@/pages/JobDetails'));
const Events = lazy(() => import('@/pages/Events'));
const Workers = lazy(() => import('@/pages/Workers'));
const WorkflowRuns = lazy(() => import('@/pages/WorkflowRuns'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const AuditLogs = lazy(() => import('@/pages/AuditLogs'));
const IncidentView = lazy(() => import('@/pages/IncidentView'));
const Telemetry = lazy(() => import('@/pages/Telemetry'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('orchestrix_token'));
  const [user, setUser] = useState<{ id: string; username: string; role: string } | null>(() => {
    const stored = localStorage.getItem('orchestrix_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((newToken: string, newUser: { id: string; username: string; role: string }) => {
    localStorage.setItem('orchestrix_token', newToken);
    localStorage.setItem('orchestrix_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('orchestrix_token');
    localStorage.removeItem('orchestrix_user');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!token;

  return (
    <ThemeProvider>
    <ToastProvider>
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      <CommandPalette />
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
        <Route element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/jobs" element={<Suspense fallback={<LoadingSpinner />}><Jobs /></Suspense>} />
          <Route path="/jobs/:id" element={<Suspense fallback={<LoadingSpinner />}><JobDetails /></Suspense>} />
          <Route path="/events" element={<Suspense fallback={<LoadingSpinner />}><Events /></Suspense>} />
          <Route path="/workers" element={<Suspense fallback={<LoadingSpinner />}><Workers /></Suspense>} />
          <Route path="/workflow-runs" element={<Suspense fallback={<LoadingSpinner />}><WorkflowRuns /></Suspense>} />
          <Route path="/analytics" element={<Suspense fallback={<LoadingSpinner />}><Analytics /></Suspense>} />
          <Route path="/audit-logs" element={<Suspense fallback={<LoadingSpinner />}><AuditLogs /></Suspense>} />
          <Route path="/incidents" element={<Suspense fallback={<LoadingSpinner />}><IncidentView /></Suspense>} />
          <Route path="/telemetry" element={<Suspense fallback={<LoadingSpinner />}><Telemetry /></Suspense>} />
        </Route>
        <Route path="*" element={<Suspense fallback={<LoadingSpinner />}><NotFound /></Suspense>} />
      </Routes>
    </AuthContext.Provider>
    </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
