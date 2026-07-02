export type AiErrorCode =
  | 'missing_api_key'
  | 'quota_exceeded'
  | 'api_error'
  | 'empty_response'
  | 'unknown'

export interface AiError {
  code: AiErrorCode
  message: string
}
