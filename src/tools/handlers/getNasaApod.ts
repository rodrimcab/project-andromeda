import { fetchNasaApod } from '@/services/nasaApodService'
import type { MediaCard } from '@/types/chat'
import type { ApodToolResult, GetNasaApodArgs } from '@/types/tools'
import { buildApodPageUrl, resolveApodImageUrl, truncateForCard } from '@/utils/apodMedia'

export interface GetNasaApodOutcome {
  result: ApodToolResult
  card: MediaCard
}

export async function getNasaApod(args: GetNasaApodArgs = {}): Promise<GetNasaApodOutcome> {
  const apod = await fetchNasaApod(args.date)
  const isVideo = apod.media_type === 'video'
  const imageUrl = resolveApodImageUrl(apod)
  const sourceUrl = buildApodPageUrl(apod.date)

  const result: ApodToolResult = {
    title: apod.title,
    explanation: apod.explanation,
    imageUrl,
    date: apod.date,
    mediaType: apod.media_type,
    sourceUrl,
    ...(apod.hdurl && { hdImageUrl: apod.hdurl }),
    ...(apod.copyright && { copyright: apod.copyright }),
  }

  const card: MediaCard = {
    title: result.title,
    description: truncateForCard(result.explanation),
    imageUrl: result.imageUrl,
    linkLabel: isVideo ? 'Watch on NASA APOD' : 'View on NASA APOD',
    linkUrl: sourceUrl,
    mediaType: apod.media_type,
    ...(isVideo && { videoUrl: apod.url }),
  }

  return { result, card }
}
