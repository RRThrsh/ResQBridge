const DEFAULT_MAX_DIMENSION = 1920
const DEFAULT_QUALITY = 0.8
const DEFAULT_FORMAT = 'image/webp'

export type CompressOptions = {
  maxDimension?: number
  quality?: number
  format?: 'image/webp' | 'image/jpeg'
}

export async function compressImage(
  file: File,
  options: CompressOptions = {},
): Promise<File> {
  const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION
  const quality = options.quality ?? DEFAULT_QUALITY
  const format = options.format ?? DEFAULT_FORMAT

  const bitmap = await createImageBitmap(file)
  let { width, height } = bitmap

  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round(height * maxDimension / width)
      width = maxDimension
    } else {
      width = Math.round(width * maxDimension / height)
      height = maxDimension
    }
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get canvas context')

  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, format, quality))
  if (!blob) throw new Error('Could not compress image')
  if (blob.size >= file.size) return file

  const ext = format === 'image/webp' ? 'webp' : 'jpg'
  const name = file.name.replace(/\.[^.]+$/, '') + '.' + ext
  return new File([blob], name, { type: format })
}
