export interface MissionSavePayload {
  title: string
  description?: string
  imageUrl?: string
  savedAt: string
  source: 'project-andromeda'
}

export type MissionSaveErrorCode = 'CONFIG' | 'NETWORK' | 'API' | 'UNKNOWN'

export class MissionSaveError extends Error {
  readonly code: MissionSaveErrorCode

  constructor(message: string, code: MissionSaveErrorCode) {
    super(message)
    this.name = 'MissionSaveError'
    this.code = code
  }
}
