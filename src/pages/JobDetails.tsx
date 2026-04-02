import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchJob, retryJob, cancelJob } from '@/api/endpoints';
import { PageHeader, StatusBadge, LoadingSpinner, ErrorMessage } from '@/components/ui';
import { formatDateFull } from '@/utils';
import { ArrowLeft, RotateCcw, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  usePageTitle(id ? `Job ${id}` : 'Job Details');

  const { data: job, isLoading, isError, error } = useQuery({
    queryKey: ['job', id],
    queryFn: () => fetchJob(id!),
    enabled: !!id,
  });

  const retryMutation = useMutation({
    mutationFn: () => retryJob(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      addToast('Job retry initiated', 'success');
    },
    onError: () => addToast('Failed to retry job', 'error'),
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelJob(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      addToast('Job cancelled', 'info');
    },
    onError: () => addToast('Failed to cancel job', 'error'),
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message={(error as Error).message} />;
  if (!job) return null;

  const canRetry = ['failed', 'cancelled'].includes(job.status);
  const canCancel = ['pending', 'running', 'retrying'].includes(job.status);

  return (
    <div>
      <button onClick={() => navigate('/jobs')} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-white mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </button>

      <PageHeader title={job.name} subtitle={`Job ID: ${job.id}`}>
        {canRetry && (
          <button
            onClick={() => retryMutation.mutate()}
            disabled={retryMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary-light rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" /> Retry
          </button>
        )}
        {canCancel && (
          <button
            onClick={() => cancelMutation.mutate()}
            disabled={cancelMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" /> Cancel
          </button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Details */}
        <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white mb-3">Job Details</h3>
          <DetailRow label="Status"><StatusBadge status={job.status} /></DetailRow>
          <DetailRow label="Type">{job.type.replace('_', ' ')}</DetailRow>
          <DetailRow label="Source">{job.source}</DetailRow>
          <DetailRow label="Created">{formatDateFull(job.created_at)}</DetailRow>
          {job.started_at && <DetailRow label="Started">{formatDateFull(job.started_at)}</DetailRow>}
          {job.completed_at && <DetailRow label="Completed">{formatDateFull(job.completed_at)}</DetailRow>}
          <DetailRow label="Retries">{job.retries} / {job.max_retries}</DetailRow>
        </div>

        {/* Error & Metadata */}
        <div className="space-y-6">
          {job.error_message && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-red-400 mb-2">Error</h3>
              <p className="text-sm text-text font-mono">{job.error_message}</p>
            </div>
          )}
          <div className="bg-surface rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Metadata</h3>
            <pre className="text-xs text-text-muted font-mono bg-surface-light rounded-lg p-3 overflow-auto">
              {JSON.stringify(job.metadata, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-sm text-white">{children}</span>
    </div>
  );
}
