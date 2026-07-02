const JUST_NOW_THRESHOLD_MS = 60_000

export function formatMissionSavedDate(savedAt: string): string {
  const savedTime = new Date(savedAt).getTime()
  if (Number.isNaN(savedTime)) {
    return 'Saved recently'
  }

  const elapsedMs = Date.now() - savedTime
  if (elapsedMs < JUST_NOW_THRESHOLD_MS) {
    return 'Saved just now'
  }

  const elapsedMinutes = Math.floor(elapsedMs / 60_000)
  if (elapsedMinutes < 60) {
    return elapsedMinutes === 1 ? 'Saved 1 minute ago' : `Saved ${elapsedMinutes} minutes ago`
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60)
  if (elapsedHours < 24) {
    return elapsedHours === 1 ? 'Saved 1 hour ago' : `Saved ${elapsedHours} hours ago`
  }

  const elapsedDays = Math.floor(elapsedHours / 24)
  if (elapsedDays === 1) {
    return 'Saved yesterday'
  }

  if (elapsedDays < 7) {
    return `Saved ${elapsedDays} days ago`
  }

  return `Saved on ${new Date(savedAt).toLocaleDateString()}`
}
