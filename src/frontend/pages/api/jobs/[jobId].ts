import type { NextApiRequest, NextApiResponse } from 'next';
import { falStatus, falResult } from '../../../utils/fal';
import type { JobStatusResponse, GenerationStage } from '../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<JobStatusResponse | { error: string }>,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { jobId } = req.query;
  if (typeof jobId !== 'string') {
    return res.status(400).json({ error: 'Invalid job ID' });
  }

  try {
    const status = await falStatus(jobId);

    if (status.status === 'COMPLETED') {
      const result = await falResult(jobId);
      return res.status(200).json({
        stage: 'completed',
        progress: 100,
        videoUrl: result.video.url,
        error: null,
      });
    }

    // Map fal status to our stage system
    const stage: GenerationStage =
      status.status === 'IN_QUEUE' ? 'queued' : 'generating_stage_1';

    // Estimate progress from logs if available
    let progress = status.status === 'IN_QUEUE' ? 0 : 50;
    if (status.logs && status.logs.length > 0) {
      // Use log count as a rough progress indicator
      progress = Math.min(90, status.logs.length * 5);
    }

    return res.status(200).json({
      stage,
      progress,
      videoUrl: null,
      error: null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Job status error:', message);
    return res.status(500).json({ error: message });
  }
}
