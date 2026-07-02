import type { FunctionCall } from '@google/generative-ai'

import type { ChatMessage, Mission } from '@/types/chat'
import type { AssistantEffect } from '@/types/ai'
import type {
  AndromedaToolName,
  GetTodayAstronomyPictureArgs,
  SaveMissionArgs,
} from '@/types/tools'

import {
  getRandomAstronomyPicture,
  getTodayAstronomyPicture,
} from './handlers/apodHandlers'
import { saveMission } from './handlers/saveMission'

export interface ToolExecutionContext {
  messages: ChatMessage[]
  missions: Mission[]
}

export interface ToolExecutionOutcome {
  response: Record<string, unknown>
  effect?: AssistantEffect
}

const KNOWN_TOOLS: ReadonlySet<string> = new Set<AndromedaToolName>([
  'get_today_astronomy_picture',
  'get_random_astronomy_picture',
  'save_mission',
])

function isKnownTool(name: string): name is AndromedaToolName {
  return KNOWN_TOOLS.has(name)
}

function parseGetTodayArgs(args: object): GetTodayAstronomyPictureArgs {
  return args as GetTodayAstronomyPictureArgs
}

function parseSaveMissionArgs(args: object): SaveMissionArgs {
  return args as SaveMissionArgs
}

export async function executeToolCall(
  call: FunctionCall,
  context: ToolExecutionContext = { messages: [], missions: [] },
): Promise<ToolExecutionOutcome> {
  if (!isKnownTool(call.name)) {
    return {
      response: { error: `Unknown tool: ${call.name}` },
    }
  }

  try {
    switch (call.name) {
      case 'get_today_astronomy_picture': {
        const args = parseGetTodayArgs(call.args)
        const { result, card } = await getTodayAstronomyPicture(args.date)
        return {
          response: { ...result },
          effect: { type: 'card', card },
        }
      }
      case 'get_random_astronomy_picture': {
        const { result, card } = await getRandomAstronomyPicture()
        return {
          response: { ...result },
          effect: { type: 'card', card },
        }
      }
      case 'save_mission': {
        const args = parseSaveMissionArgs(call.args)
        const result = await saveMission(args, context)
        return {
          response: { ...result },
          effect: {
            type: 'mission_saved',
            title: result.title,
            savedAt: result.savedAt,
            remoteSaved: result.remoteSaved,
            ...(result.duplicate && { duplicate: true }),
            ...(result.description && { description: result.description }),
            ...(result.imageUrl && { imageUrl: result.imageUrl }),
            ...(result.sourceUrl && { sourceUrl: result.sourceUrl }),
            ...(result.warning && { warning: result.warning }),
          },
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Tool execution failed.'
    return { response: { error: message } }
  }
}
