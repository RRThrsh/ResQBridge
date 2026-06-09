export const MAX_IMAGE_DATA_URL_LENGTH = 70_000_000

// Used by AdminWildlifeDialog
export function validateImageDataUrl(dataUrl: string): string | null {
  if (!dataUrl.trim()) {
    return 'Please upload an image'
  }
  if (dataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
    return 'Image is too large. Use a smaller file (5 MB or less).'
  }
  return null
}
