const SAVE_INTENT_PATTERNS = [
  /\b(save|guarda|guardar|bookmark|añade|agrega|add)\b.*\b(mission|misión|mision|imagen|image|esto|this|log|registro)\b/i,
  /\b(guarda|save)\s+(esto|this|la|el|the)\b/i,
  /\b(misión|mision|mission).*\b(guarda|guardar|save)\b/i,
  /\b(guarda|guardar|save)\b.*\b(misiones|missions)\b/i,
]

export function detectSaveIntent(text: string): boolean {
  const normalized = text.trim()
  if (!normalized) {
    return false
  }

  return SAVE_INTENT_PATTERNS.some((pattern) => pattern.test(normalized))
}
