export type AndromedaToolName =
  | 'get_today_astronomy_picture'
  | 'get_random_astronomy_picture'
  | 'save_mission'

export interface GetTodayAstronomyPictureArgs {
  date?: string
}

export interface SaveMissionArgs {
  title?: string
  description?: string
  imageUrl?: string
}

export interface ApodToolResult {
  title: string
  explanation: string
  date: string
  mediaType: 'image' | 'video'
  imageUrl?: string
  hdImageUrl?: string
  sourceUrl?: string
  copyright?: string
  videoUrl?: string
  videoUnavailable?: boolean
}

export interface SaveMissionToolResult {
  success: boolean
  title: string
  savedAt: string
  imageUrl?: string
  description?: string
  sourceUrl?: string
  remoteSaved: boolean
  duplicate?: boolean
  warning?: string
}
