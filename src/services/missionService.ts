import { env } from '@/config/env'
import { MissionSaveError, type MissionSavePayload } from '@/types/mission'

export async function saveMissionToPipedream(payload: MissionSavePayload): Promise<void> {
  const webhookUrl = env.pipedreamWebhookUrl?.trim()
  if (!webhookUrl) {
    throw new MissionSaveError(
      'Pipedream webhook URL is not configured. Set VITE_PIPEDREAM_WEBHOOK_URL in your .env file.',
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
