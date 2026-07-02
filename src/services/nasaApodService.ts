import { env } from '@/config/env'
import { NasaApodError, type NasaApodResponse } from '@/types/nasa'

const APOD_API_URL = 'https://api.nasa.gov/planetary/apod'
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
const APOD_EPOCH = '1995-06-16'

export function validateApodDate(date: string): void {
  if (!DATE_REGEX.test(date)) {
    throw new NasaApodError('Date must be in YYYY-MM-DD format.', 'INVALID_DATE')
  }

  const parsed = new Date(`${date}T12:00:00Z`)
  if (Number.isNaN(parsed.getTime())) {
    throw new NasaApodError('Invalid calendar date.', 'INVALID_DATE')
  }

  if (date < APOD_EPOCH) {
    throw new NasaApodError(`APOD is only available from ${APOD_EPOCH} onward.`, 'INVALID_DATE')
  }

  const today = new Date().toISOString().slice(0, 10)
  if (date > today) {
    throw new NasaApodError('Cannot fetch APOD for a future date.', 'INVALID_DATE')
  }
}

function parseApiErrorDetail(body: unknown): string {
  if (!body || typeof body !== 'object') {
    return ''
  }

  const record = body as Record<string, unknown>
  if (typeof record.msg === 'string') {
    return ` ${record.msg}`
  }

  const nestedError = record.error
  if (
    nestedError &&
    typeof nestedError === 'object' &&
    'message' in nestedError &&
    typeof nestedError.message === 'string'
  ) {
    return ` ${nestedError.message}`
  }

  return ''
}

function getApiKey(): string {
  const apiKey = env.nasaApiKey?.trim()
  if (!apiKey) {
    throw new NasaApodError(
      'NASA API key is not configured. Set VITE_NASA_API_KEY in your .env file.',
      'CONFIG',
    )
  }

  return apiKey
}

function validateApodResponse(data: NasaApodResponse): NasaApodResponse {
  if (!data.title || !data.explanation || !data.url || !data.media_type) {
    throw new NasaApodError('NASA returned an incomplete APOD response.', 'API')
  }

  return data
}

async function requestApod(params: URLSearchParams): Promise<NasaApodResponse> {
  let response: Response
  try {
    response = await fetch(`${APOD_API_URL}?${params}`)
  } catch {
    throw new NasaApodError(
      'Unable to reach the NASA APOD service. Check your network connection.',
      'NETWORK',
    )
  }

  if (response.status === 429) {
    throw new NasaApodError('NASA API rate limit exceeded. Try again in a few minutes.', 'RATE_LIMIT')
  }

  if (response.status === 404) {
    throw new NasaApodError('No APOD found for the requested date.', 'NOT_FOUND')
  }

  if (!response.ok) {
    let detail = ''
    try {
      detail = parseApiErrorDetail(await response.json())
    } catch {
      // Response body is not JSON — use status only.
    }

    throw new NasaApodError(`NASA APOD request failed (${response.status}).${detail}`, 'API')
  }

  return validateApodResponse((await response.json()) as NasaApodResponse)
}

export async function fetchNasaApodToday(date?: string): Promise<NasaApodResponse> {
  const queryDate = date ?? new Date().toISOString().slice(0, 10)
  validateApodDate(queryDate)

  const params = new URLSearchParams({
    api_key: getApiKey(),
    date: queryDate,
    thumbs: 'true',
  })

  return requestApod(params)
}

export async function fetchRandomNasaApod(): Promise<NasaApodResponse> {
  const params = new URLSearchParams({
    api_key: getApiKey(),
    count: '1',
    thumbs: 'true',
  })

  let response: Response
  try {
    response = await fetch(`${APOD_API_URL}?${params}`)
  } catch {
    throw new NasaApodError(
      'Unable to reach the NASA APOD service. Check your network connection.',
      'NETWORK',
    )
  }

  if (response.status === 429) {
    throw new NasaApodError('NASA API rate limit exceeded. Try again in a few minutes.', 'RATE_LIMIT')
  }

  if (!response.ok) {
    let detail = ''
    try {
      detail = parseApiErrorDetail(await response.json())
    } catch {
      // Response body is not JSON — use status only.
    }

    throw new NasaApodError(`NASA APOD request failed (${response.status}).${detail}`, 'API')
  }

  const data = (await response.json()) as NasaApodResponse | NasaApodResponse[]
  const apod = Array.isArray(data) ? data[0] : data

  if (!apod) {
    throw new NasaApodError('NASA returned an empty random APOD response.', 'API')
  }

  return validateApodResponse(apod)
}

/** @deprecated Use fetchNasaApodToday instead. */
export async function fetchNasaApod(date?: string): Promise<NasaApodResponse> {
  return fetchNasaApodToday(date)
}
