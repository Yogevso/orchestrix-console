import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Ghost } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-page-bg flex items-center justify-center">
      <div className="text-center">
        <Ghost className="w-16 h-16 text-text-muted mx-auto mb-4" />
        <h1 className="text-6xl font-bold text-white mb-2">404</h1>
        <p className="text-text-muted mb-6">This page doesn't exist.</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary-light rounded-lg text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>
    </div>
  );
}
