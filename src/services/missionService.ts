import { env } from '@/config/env'
import { MissionSaveError, type MissionSavePayload } from '@/types/mission'

export async function saveMissionToRequestBin(
  payload: MissionSavePayload,
): Promise<void> {
  const webhookUrl = env.requestBinUrl?.trim()
  if (!webhookUrl) {
    throw new MissionSaveError(
      'RequestBin URL is not configured. Set VITE_REQUESTBIN_URL in your .env file.',
      'CONFIG',
    )
  }

  let response: Response
  try {
    response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new MissionSaveError(
      'Unable to reach the mission log service. Check your network connection.',
      'NETWORK',
    )
  }

  if (!response.ok) {
    throw new MissionSaveError(`Mission save failed (${response.status}).`, 'API')
  }
}

/** @deprecated Use saveMissionToRequestBin instead. */
export async function saveMissionToPipedream(payload: MissionSavePayload): Promise<void> {
  return saveMissionToRequestBin(payload)
}
