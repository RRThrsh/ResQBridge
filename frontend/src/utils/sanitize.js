export function sanitizeText(val) {
  return val.replace(/<[^>]*>/g, '').trim()
}
