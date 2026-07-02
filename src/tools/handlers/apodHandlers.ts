import { fetchNasaApodToday, fetchRandomNasaApod } from '@/services/nasaApodService'
import type { NasaApodResponse } from '@/types/nasa'
import type { MediaCard } from '@/types/chat'
import type { ApodToolResult } from '@/types/tools'
import { buildApodPageUrl, resolveApodImageUrl, truncateForCard } from '@/utils/apodMedia'

export interface ApodHandlerOutcome {
  result: ApodToolResult
  card: MediaCard
}

export function buildApodOutcome(apod: NasaApodResponse): ApodHandlerOutcome {
  const isVideo = apod.media_type === 'video'
  const imageUrl = resolveApodImageUrl(apod)
  const sourceUrl = buildApodPageUrl(apod.date)
  const videoUnavailable = isVideo && !imageUrl

  const result: ApodToolResult = {
    title: apod.title,
    explanation: apod.explanation,
    date: apod.date,
    mediaType: apod.media_type,
    sourceUrl,
    ...(imageUrl && { imageUrl }),
    ...(apod.hdurl && { hdImageUrl: apod.hdurl }),
    ...(apod.copyright && { copyright: apod.copyright }),
    ...(isVideo && { videoUrl: apod.url }),
    ...(videoUnavailable && { videoUnavailable: true }),
  }

  const card: MediaCard = {
    title: result.title,
    description: truncateForCard(result.explanation),
    linkLabel: 'View on NASA APOD',
    linkUrl: sourceUrl,
    mediaType: apod.media_type,
    ...(imageUrl && { imageUrl }),
    ...(isVideo && { videoUrl: apod.url }),
    ...(videoUnavailable && { videoUnavailable: true }),
  }

  return { result, card }
}

export async function getTodayAstronomyPicture(date?: string): Promise<ApodHandlerOutcome> {
  const apod = await fetchNasaApodToday(date)
  return buildApodOutcome(apod)
}

export async function getRandomAstronomyPicture(): Promise<ApodHandlerOutcome> {
  const apod = await fetchRandomNasaApod()
  return buildApodOutcome(apod)
}
