import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { login as loginApi } from '@/api/endpoints';
import { Zap, Loader2 } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginApi({ username, password });
      login(res.access_token, res.user);
      navigate('/');
    } catch {
      setError('Invalid credentials. Try admin / admin');
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
            <label className="block text-sm text-text-muted mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-surface-light border border-border px-4 py-2.5 text-sm text-white placeholder-text-muted/50 focus:outline-none focus:border-primary transition-colors"
              style={{ borderRadius: 'var(--radius-sm)' }}
              placeholder="Enter username"
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
            disabled={loading || !username || !password}
            className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-4 py-2.5 text-sm transition-colors flex items-center justify-center gap-2"
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-xs text-text-muted/60 text-center mt-3">
            Demo credentials: admin / admin
          </p>
        </form>
      </div>
    </div>
  );
}
