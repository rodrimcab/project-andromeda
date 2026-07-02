/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_GEMINI_MODEL?: string
  readonly VITE_NASA_API_KEY?: string
  readonly VITE_REQUESTBIN_URL?: string
  /** @deprecated Use VITE_REQUESTBIN_URL */
  readonly VITE_PIPEDREAM_WEBHOOK_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
