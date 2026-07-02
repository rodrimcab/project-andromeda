import type { MediaCard } from '@/types/chat'
import type { ApodToolResult, GetNasaApodArgs } from '@/types/tools'

/** Stub APOD data — replaced by the NASA API in Phase 6. */
const STUB_APOD = {
  title: 'Pillars of Creation',
  explanation:
    'Newly formed stars are firing off jets of hot gas in this cosmic vista from NASA’s James Webb Space Telescope. The Pillars of Creation are part of the Eagle Nebula, roughly 6,500 light-years away.',
  imageUrl:
    'https://images-assets.nasa.gov/image/STScI-PRC22-08a/STScI-PRC22-08a~orig.jpg',
  sourceUrl: 'https://apod.nasa.gov/apod/',
} as const

export interface GetNasaApodOutcome {
  result: ApodToolResult
  card: MediaCard
}

export async function getNasaApod(args: GetNasaApodArgs = {}): Promise<GetNasaApodOutcome> {
  const date = args.date ?? new Date().toISOString().slice(0, 10)

  const result: ApodToolResult = {
    title: STUB_APOD.title,
    explanation: STUB_APOD.explanation,
    imageUrl: STUB_APOD.imageUrl,
    date,
    mediaType: 'image',
    sourceUrl: STUB_APOD.sourceUrl,
  }

  const card: MediaCard = {
    title: result.title,
    description: result.explanation,
    imageUrl: result.imageUrl,
    linkLabel: 'View on NASA APOD',
    linkUrl: result.sourceUrl ?? STUB_APOD.sourceUrl,
  }

  return { result, card }
}
