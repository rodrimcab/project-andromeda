export type SpeechPermissionState = 'prompt' | 'granted' | 'denied' | 'unknown'

export type SpeechRecognitionErrorCode =
  | 'not-supported'
  | 'not-allowed'
  | 'no-speech'
  | 'audio-capture'
  | 'network'
  | 'aborted'
  | 'unknown'

export interface SpeechRecognitionResult {
  transcript: string
  isFinal: boolean
}
