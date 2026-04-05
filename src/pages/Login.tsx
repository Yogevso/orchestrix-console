import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { login as mockLoginApi } from '@/api/endpoints';
import { iamLogin } from '@/services/iamApi';
import { Zap, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Try IAM login first
      const res = await iamLogin({ tenant_slug: tenantSlug || 'default', email, password });
      localStorage.setItem('orchestrix_refresh_token', res.refresh_token);
      login(res.access_token, { id: res.user.id, username: res.user.email, role: res.user.role });
      navigate('/');
    } catch {
      // Fall back to mock login for development
      try {
        const res = await mockLoginApi({ username: email, password });
        login(res.access_token, res.user);
        navigate('/');
      } catch {
        setError('Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-page-bg px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Zap className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-white tracking-tight">Orchestrix</span>
          </div>
          <p className="text-text-muted text-sm">Sign in to the operations console</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-border p-6 space-y-4" style={{ borderRadius: 'var(--radius-card)' }}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400" style={{ borderRadius: 'var(--radius-sm)' }}>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-text-muted mb-1.5">Tenant</label>
            <input
              type="text"
              value={tenantSlug}
              onChange={(e) => setTenantSlug(e.target.value)}
              className="w-full bg-surface-light border border-border px-4 py-2.5 text-sm text-white placeholder-text-muted/50 focus:outline-none focus:border-primary transition-colors"
              style={{ borderRadius: 'var(--radius-sm)' }}
              placeholder="default"
              autoComplete="organization"
            />
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-1.5">Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-light border border-border px-4 py-2.5 text-sm text-white placeholder-text-muted/50 focus:outline-none focus:border-primary transition-colors"
              style={{ borderRadius: 'var(--radius-sm)' }}
              placeholder="Enter email"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-light border border-border px-4 py-2.5 text-sm text-white placeholder-text-muted/50 focus:outline-none focus:border-primary transition-colors"
              style={{ borderRadius: 'var(--radius-sm)' }}
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-4 py-2.5 text-sm transition-colors flex items-center justify-center gap-2"
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-xs text-text-muted/60 text-center mt-3">
            Uses IAM service for authentication. Dev fallback: admin / admin
          </p>
        </form>
      </div>
    </div>
  );
}
