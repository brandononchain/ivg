import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  GenerationJob,
  GenerationParams,
  GenerationStage,
  JobStatusResponse,
} from '../types';
import { DEFAULT_PARAMS } from '../types';

const POLL_INTERVAL_MS = 2000;

export function useGeneration() {
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [params, setParams] = useState<GenerationParams>(DEFAULT_PARAMS);
  const pollRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  /** Update a single job in the list */
  const updateJob = useCallback((id: string, patch: Partial<GenerationJob>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j)));
  }, []);

  /** Stop polling for a job */
  const stopPolling = useCallback((id: string) => {
    const timer = pollRef.current.get(id);
    if (timer) {
      clearInterval(timer);
      pollRef.current.delete(id);
    }
  }, []);

  /** Poll for job status updates */
  const startPolling = useCallback(
    (jobId: string) => {
      const timer = setInterval(async () => {
        try {
          const res = await fetch(`/api/jobs/${jobId}`);
          if (!res.ok) throw new Error(`Status check failed: ${res.status}`);

          const data: JobStatusResponse = await res.json();

          updateJob(jobId, {
            stage: data.stage,
            progress: data.progress,
            videoUrl: data.videoUrl,
            error: data.error,
          });

          // Stop polling when terminal
          if (data.stage === 'completed' || data.stage === 'failed') {
            stopPolling(jobId);
          }
        } catch (err) {
          console.error('Poll error:', err);
          updateJob(jobId, {
            stage: 'failed',
            error: err instanceof Error ? err.message : 'Polling failed',
          });
          stopPolling(jobId);
        }
      }, POLL_INTERVAL_MS);

      pollRef.current.set(jobId, timer);
    },
    [updateJob, stopPolling],
  );

  /** Submit a new generation */
  const generate = useCallback(
    async (prompt: string) => {
      // Optimistically add job
      const tempId = `pending-${Date.now()}`;
      const newJob: GenerationJob = {
        id: tempId,
        prompt,
        params: { ...params },
        stage: 'queued',
        progress: 0,
        videoUrl: null,
        error: null,
        createdAt: Date.now(),
      };

      setJobs((prev) => [newJob, ...prev]);

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, params }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: 'Request failed' }));
          throw new Error(body.error || `HTTP ${res.status}`);
        }

        const { jobId } = await res.json();

        // Replace temp ID with real job ID
        setJobs((prev) =>
          prev.map((j) =>
            j.id === tempId
              ? { ...j, id: jobId, stage: 'loading_model' as GenerationStage }
              : j,
          ),
        );

        startPolling(jobId);
      } catch (err) {
        updateJob(tempId, {
          stage: 'failed',
          error: err instanceof Error ? err.message : 'Failed to start generation',
        });
      }
    },
    [params, startPolling, updateJob],
  );

  /** Cancel / dismiss a job */
  const dismissJob = useCallback(
    (id: string) => {
      stopPolling(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    },
    [stopPolling],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pollRef.current.forEach((timer) => clearInterval(timer));
    };
  }, []);

  const activeJob = jobs.find(
    (j) => j.stage !== 'completed' && j.stage !== 'failed',
  );
  const isGenerating = !!activeJob;

  return {
    jobs,
    params,
    setParams,
    generate,
    dismissJob,
    activeJob,
    isGenerating,
  };
}
