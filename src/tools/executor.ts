import type { FunctionCall } from '@google/generative-ai'

import type { AssistantEffect } from '@/types/ai'
import type { AndromedaToolName, GetNasaApodArgs, SaveMissionArgs } from '@/types/tools'

import { getNasaApod } from './handlers/getNasaApod'
import { saveMission } from './handlers/saveMission'

export interface ToolExecutionOutcome {
  response: Record<string, unknown>
  effect?: AssistantEffect
}

const KNOWN_TOOLS: ReadonlySet<string> = new Set<AndromedaToolName>([
  'get_nasa_apod',
  'save_mission',
])

function isKnownTool(name: string): name is AndromedaToolName {
  return KNOWN_TOOLS.has(name)
}

function parseGetNasaApodArgs(args: object): GetNasaApodArgs {
  return args as GetNasaApodArgs
}

function parseSaveMissionArgs(args: object): SaveMissionArgs {
  return args as SaveMissionArgs
}

export async function executeToolCall(call: FunctionCall): Promise<ToolExecutionOutcome> {
  if (!isKnownTool(call.name)) {
    return {
      response: { error: `Unknown tool: ${call.name}` },
    }
  }

  try {
    switch (call.name) {
      case 'get_nasa_apod': {
        const args = parseGetNasaApodArgs(call.args)
        const { result, card } = await getNasaApod(args)
        return {
          response: { ...result },
          effect: { type: 'card', card },
        }
      }
      case 'save_mission': {
        const args = parseSaveMissionArgs(call.args)
        const result = await saveMission(args)
        return {
          response: { ...result },
          effect: { type: 'mission_saved', title: result.title },
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Tool execution failed.'
    return { response: { error: message } }
  }
}
