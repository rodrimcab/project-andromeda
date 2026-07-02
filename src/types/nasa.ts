export interface NasaApodResponse {
  copyright?: string
  date: string
  explanation: string
  hdurl?: string
  media_type: 'image' | 'video'
  service_version: string
  title: string
  url: string
  thumbnail_url?: string
}

export type NasaApodErrorCode =
  | 'CONFIG'
  | 'INVALID_DATE'
  | 'NOT_FOUND'
  | 'RATE_LIMIT'
  | 'NETWORK'
  | 'API'
  | 'UNKNOWN'

export class NasaApodError extends Error {
  readonly code: NasaApodErrorCode

  constructor(message: string, code: NasaApodErrorCode) {
    super(message)
    this.name = 'NasaApodError'
    this.code = code
  }
}
