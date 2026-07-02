export type AndromedaToolName = 'get_nasa_apod' | 'save_mission'

export interface GetNasaApodArgs {
  date?: string
}

export interface SaveMissionArgs {
  title: string
  description?: string
  imageUrl?: string
}

export interface ApodToolResult {
  title: string
  explanation: string
  imageUrl: string
  date: string
  mediaType: 'image' | 'video'
  hdImageUrl?: string
  sourceUrl?: string
  copyright?: string
}

export interface SaveMissionToolResult {
  success: boolean
  title: string
  savedAt: string
}
