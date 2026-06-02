export function normalizeContactPhone(value: string) {
  const contactPhone = value.trim()
  if (!contactPhone) {
    throw new Error('Contact number is required.')
  }
  return contactPhone
}
