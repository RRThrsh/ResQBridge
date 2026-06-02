export const MAX_IMAGE_FILE_BYTES = 50 * 1024 * 1024
export const MAX_IMAGE_DATA_URL_LENGTH = 70_000_000

export function readImageFile(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(typeof reader.result === 'string' ? reader.result : null)
    }
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}

export function validateImageDataUrl(dataUrl: string): string | null {
  if (!dataUrl.trim()) {
    return 'Please upload an image'
  }
  if (dataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
    return 'Image is too large. Use a smaller file (50 MB or less).'
  }
  return null
}
