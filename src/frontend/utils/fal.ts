/**
 * fal.ai REST API client for LTX-Video generation.
 *
 * Uses the queue API so generation runs async:
 *   POST  queue.fal.run/{model}           → submit
 *   GET   queue.fal.run/{model}/requests/{id}/status  → poll
 *   GET   queue.fal.run/{model}/requests/{id}         → result
 */

const FAL_BASE = 'https://queue.fal.run';

function falModel(): string {
  return process.env.FAL_MODEL_ID || 'fal-ai/ltx-video';
}

function falKey(): string {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error('FAL_KEY environment variable is not set');
  return key;
}

function headers(): Record<string, string> {
  return {
    Authorization: `Key ${falKey()}`,
    'Content-Type': 'application/json',
  };
}

export interface FalSubmitResponse {
  request_id: string;
  status?: string;
}

export interface FalStatusResponse {
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED';
  logs?: Array<{ message: string; timestamp: string }>;
}

export interface FalResultResponse {
  video: { url: string; content_type: string };
  seed: number;
}

/** Submit a generation job to the fal.ai queue */
export async function falSubmit(input: Record<string, unknown>): Promise<FalSubmitResponse> {
  const res = await fetch(`${FAL_BASE}/${falModel()}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`fal.ai submit failed (${res.status}): ${body}`);
  }
  return res.json();
}

/** Check the status of a queued request */
export async function falStatus(requestId: string): Promise<FalStatusResponse> {
  const res = await fetch(`${FAL_BASE}/${falModel()}/requests/${requestId}/status`, {
    headers: headers(),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`fal.ai status failed (${res.status}): ${body}`);
  }
  return res.json();
}

/** Fetch the completed result */
export async function falResult(requestId: string): Promise<FalResultResponse> {
  const res = await fetch(`${FAL_BASE}/${falModel()}/requests/${requestId}`, {
    headers: headers(),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`fal.ai result failed (${res.status}): ${body}`);
  }
  return res.json();
}
