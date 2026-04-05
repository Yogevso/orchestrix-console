import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWorkflowRuns, getWorkflows, startWorkflowRun, pauseWorkflowRun, resumeWorkflowRun, cancelWorkflowRun } from '@/services/engineApi';
import { PageHeader, LoadingSpinner, EmptyState, ErrorMessage } from '@/components/ui';
import { usePageTitle } from '@/hooks/usePageTitle';
import { formatDate, cn } from '@/utils';
import { GitBranch, Play, Pause, Square, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { EngineWorkflowStatus, EngineStepStatus, EngineWorkflowRun } from '@/types/engine';

const RUN_STATUS_COLORS: Record<EngineWorkflowStatus, string> = {
  PENDING: 'text-gray-400 bg-gray-400/10 border-gray-400/30',
  RUNNING: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  SUCCEEDED: 'text-green-400 bg-green-400/10 border-green-400/30',
  FAILED: 'text-red-400 bg-red-400/10 border-red-400/30',
  CANCELLED: 'text-gray-500 bg-gray-500/10 border-gray-500/30',
  PAUSED: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
};

const STEP_STATUS_COLORS: Record<EngineStepStatus, string> = {
  PENDING: 'bg-gray-500',
  QUEUED: 'bg-gray-400',
  RUNNING: 'bg-blue-400 animate-pulse',
  SUCCEEDED: 'bg-green-400',
  FAILED: 'bg-red-400',
  SKIPPED: 'bg-gray-600',
  CANCELLED: 'bg-gray-500',
};

function RunCard({ run }: { run: EngineWorkflowRun }) {
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();

  const pauseMutation = useMutation({
    mutationFn: () => pauseWorkflowRun(run.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['engine-workflow-runs'] }),
  });
  const resumeMutation = useMutation({
    mutationFn: () => resumeWorkflowRun(run.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['engine-workflow-runs'] }),
  });
  const cancelMutation = useMutation({
    mutationFn: () => cancelWorkflowRun(run.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['engine-workflow-runs'] }),
  });

  return (
    <div className="bg-surface rounded-xl border border-border">
      <div className="flex items-center justify-between px-5 py-4">
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 min-w-0">
          {expanded ? <ChevronDown className="w-4 h-4 text-text-muted shrink-0" /> : <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />}
          <div className="text-left min-w-0">
            <p className="text-sm font-medium text-white truncate">Run {run.id.slice(0, 8)}…</p>
            <p className="text-xs text-text-muted">{formatDate(run.created_at)} · {run.steps.length} steps</p>
          </div>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          {run.status === 'RUNNING' && (
            <button onClick={() => pauseMutation.mutate()} className="p-1.5 rounded-lg text-yellow-400 hover:bg-yellow-400/10 transition-colors" title="Pause">
              <Pause className="w-4 h-4" />
            </button>
          )}
          {run.status === 'PAUSED' && (
            <button onClick={() => resumeMutation.mutate()} className="p-1.5 rounded-lg text-green-400 hover:bg-green-400/10 transition-colors" title="Resume">
              <Play className="w-4 h-4" />
            </button>
          )}
          {(run.status === 'RUNNING' || run.status === 'PAUSED') && (
            <button onClick={() => cancelMutation.mutate()} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Cancel">
              <Square className="w-4 h-4" />
            </button>
          )}
          <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border', RUN_STATUS_COLORS[run.status])}>
            {run.status}
          </span>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border px-5 py-3">
          <div className="space-y-2">
            {run.steps.map((step) => (
              <div key={step.id} className="flex items-center gap-3 py-1.5">
                <span className={cn('w-2 h-2 rounded-full shrink-0', STEP_STATUS_COLORS[step.status])} />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-white">{step.step_name}</span>
                  <span className="text-xs text-text-muted ml-2">({step.job_type})</span>
                </div>
                {step.depends_on.length > 0 && (
                  <span className="text-xs text-text-muted">← {step.depends_on.join(', ')}</span>
                )}
                <span className="text-xs text-text-muted">{step.status}</span>
                {step.last_error && (
                  <span className="text-xs text-red-400 truncate max-w-[200px]" title={step.last_error}>{step.last_error}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkflowRuns() {
  usePageTitle('Workflow Runs');
  const runsQuery = useQuery({
    queryKey: ['engine-workflow-runs'],
    queryFn: () => getWorkflowRuns({ limit: 50 }),
    refetchInterval: 10_000,
  });
  const workflowsQuery = useQuery({
    queryKey: ['engine-workflows'],
    queryFn: getWorkflows,
  });

  const queryClient = useQueryClient();
  const [selectedWorkflow, setSelectedWorkflow] = useState('');

  const startMutation = useMutation({
    mutationFn: (workflowId: string) => startWorkflowRun({ workflow_id: workflowId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['engine-workflow-runs'] }),
  });

  if (runsQuery.isLoading) return <LoadingSpinner />;
  if (runsQuery.error) return <ErrorMessage message="Failed to load workflow runs" onRetry={runsQuery.refetch} />;

  const runs = runsQuery.data ?? [];
  const workflows = workflowsQuery.data ?? [];

  return (
    <div>
      <PageHeader title="Workflow Runs" subtitle={`${runs.length} runs`}>
        {workflows.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={selectedWorkflow}
              onChange={(e) => setSelectedWorkflow(e.target.value)}
              className="bg-surface-light border border-border rounded-lg px-3 py-1.5 text-sm text-text focus:outline-none focus:border-primary"
            >
              <option value="">Select workflow…</option>
              {workflows.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            <button
              onClick={() => selectedWorkflow && startMutation.mutate(selectedWorkflow)}
              disabled={!selectedWorkflow || startMutation.isPending}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary-light rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              Start Run
            </button>
          </div>
        )}
      </PageHeader>

      {runs.length === 0 ? (
        <EmptyState icon={GitBranch} title="No workflow runs" description="Start a workflow run to see execution progress here." />
      ) : (
        <div className="space-y-3">
          {runs.map((run) => (
            <RunCard key={run.id} run={run} />
          ))}
        </div>
      )}
    </div>
  );
}
