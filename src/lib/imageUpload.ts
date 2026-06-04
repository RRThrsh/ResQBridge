export const MAX_IMAGE_FILE_BYTES = 5 * 1024 * 1024

export function validateImageFile(file: File): string | null {
  if (!file) {
    return 'Please upload an image'
  }

  if (!file.type.startsWith('image/')) {
    return 'Only image files are allowed'
  }

  if (file.size > MAX_IMAGE_FILE_BYTES) {
    return 'Image is too large. Maximum size is 5MB.'
  }

  return null
}