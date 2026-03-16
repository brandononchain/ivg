import type { NextApiRequest, NextApiResponse } from 'next';
import { falSubmit } from '../../utils/fal';
import type { GenerateRequest, GenerateResponse } from '../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateResponse | { error: string }>,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, params } = req.body as GenerateRequest;

    if (!prompt?.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Map our params to fal.ai input schema
    const input: Record<string, unknown> = {
      prompt: prompt.trim(),
      num_frames: params.numFrames,
      width: params.width,
      height: params.height,
      guidance_scale: params.cfgScale,
      num_inference_steps: pipelineSteps(params.pipeline),
    };

    // Only set seed if user provided one
    if (params.seed) {
      input.seed = parseInt(params.seed, 10);
    }

    const result = await falSubmit(input);

    return res.status(200).json({ jobId: result.request_id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Generate error:', message);
    return res.status(500).json({ error: message });
  }
}

function pipelineSteps(pipeline: string): number {
  const map: Record<string, number> = {
    TI2VidTwoStagesPipeline: 40,
    TI2VidTwoStagesHQPipeline: 20,
    DistilledPipeline: 8,
    A2VidPipelineTwoStage: 40,
  };
  return map[pipeline] ?? 40;
}
