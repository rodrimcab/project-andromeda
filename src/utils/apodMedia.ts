import type { NasaApodResponse } from '@/types/nasa'

const VIDEO_FALLBACK_IMAGE =
  'https://images-assets.nasa.gov/image/PIA04213/PIA04213~thumb.jpg'

export function buildApodPageUrl(date: string): string {
  const [year, month, day] = date.split('-')
  if (!year || !month || !day) {
    throw new Error(`Invalid APOD date: ${date}`)
  }

  return `https://apod.nasa.gov/apod/ap${year.slice(2)}${month}${day}.html`
}

export function getYouTubeThumbnail(videoUrl: string): string | null {
  const embedMatch = videoUrl.match(/youtube\.com\/embed\/([^?&/]+)/)
  const watchMatch = videoUrl.match(/[?&]v=([^&]+)/)
  const shortMatch = videoUrl.match(/youtu\.be\/([^?&/]+)/)
  const id = embedMatch?.[1] ?? watchMatch?.[1] ?? shortMatch?.[1]
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}

export function resolveApodImageUrl(apod: NasaApodResponse): string {
  if (apod.media_type === 'image') {
    return apod.hdurl ?? apod.url
  }

  if (apod.thumbnail_url) {
    return apod.thumbnail_url
  }

  const youtubeThumb = getYouTubeThumbnail(apod.url)
  if (youtubeThumb) {
    return youtubeThumb
  }

  return VIDEO_FALLBACK_IMAGE
}

export function truncateForCard(text: string, maxLength = 280): string {
  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength).trimEnd()}…`
}
