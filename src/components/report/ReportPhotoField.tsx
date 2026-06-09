import { useEffect, useRef, useState } from 'react'
import { useMutation } from 'convex/react'
import { Camera, Loader2, Plus, X } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import {
  MAX_REPORT_PHOTOS,
  MAX_REPORT_PHOTOS_TOTAL_BYTES,
  REPORT_PHOTO_ACCEPT,
  formatPhotoSizeMb,
  remainingPhotoBudgetBytes,
  sumPhotoBytes,
  type ReportPhotoItem,
} from '@/lib/reportPhotos'
import { compressImage } from '@/lib/compressImage'
import { useLanguage } from '@/context/LanguageContext'
import { toast } from 'sonner'

type Props = {
  value: ReportPhotoItem[]
  onChange: (value: ReportPhotoItem[]) => void
  required?: boolean
  maxPhotos?: number
  /** When false, embeds legacy data URLs (for editing old reports only). */
  useStorageUpload?: boolean
}

function readImageFile(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(typeof reader.result === 'string' ? reader.result : null)
    }
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}

function isBlobPreview(url: string) {
  return url.startsWith('blob:')
}

export function ReportPhotoField({
  value,
  onChange,
  required = true,
  maxPhotos = MAX_REPORT_PHOTOS,
  useStorageUpload = true,
}: Props) {
  const { t } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const generateUploadUrl = useMutation(api.reportPhotoStorage.generateUploadUrl)
  const [uploading, setUploading] = useState(false)
  const blobUrlsRef = useRef<Set<string>>(new Set())

  const currentTotalBytes = sumPhotoBytes(value.map((item) => item.sizeBytes))
  const canAddMore = value.length < maxPhotos

  useEffect(() => {
    const blobUrls = blobUrlsRef.current
    return () => {
      for (const url of blobUrls) {
        URL.revokeObjectURL(url)
      }
      blobUrls.clear()
    }
  }, [])

  async function uploadToStorage(file: File): Promise<Id<'_storage'>> {
    const uploadUrl = await generateUploadUrl()
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file,
    })
    if (!response.ok) {
      throw new Error('Upload failed')
    }
    const json = (await response.json()) as { storageId: Id<'_storage'> }
    return json.storageId
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length === 0) return

    const remaining = maxPhotos - value.length
    if (remaining <= 0) {
      toast.error(t('reportPhoto.errorMax').replace('{max}', String(maxPhotos)))
      return
    }

    const toAdd = files.slice(0, remaining)
    if (files.length > remaining) {
      const skipped = files.length - remaining
      if (value.length === 0 && files.length > maxPhotos) {
        toast.message(t('reportPhoto.errorTooMany').replace('{total}', String(files.length)).replace('{max}', String(maxPhotos)))
      } else {
        toast.message(t('reportPhoto.errorSomeSkipped').replace('{remaining}', String(remaining)).replace('{skipped}', String(skipped)).replace('{max}', String(maxPhotos)))
      }
    }

    const accepted: File[] = []
    let runningTotal = currentTotalBytes

    for (const file of toAdd) {
      if (!file.type.startsWith('image/')) {
        toast.error(t('reportPhoto.errorInvalidType').replace('{name}', file.name))
        continue
      }
      if (runningTotal + file.size > MAX_REPORT_PHOTOS_TOTAL_BYTES) {
        const remainingMb = formatPhotoSizeMb(remainingPhotoBudgetBytes(runningTotal))
        toast.error(t('reportPhoto.errorBudget').replace('{name}', file.name).replace('{remaining}', remainingMb))
        continue
      }
      accepted.push(file)
      runningTotal += file.size
    }

    if (accepted.length === 0) return

    setUploading(true)
    const next = [...value]
    let added = 0

    try {
      for (const file of accepted) {
        const compressed = await compressImage(file)
        if (useStorageUpload) {
          const storageId = await uploadToStorage(compressed)
          const previewUrl = URL.createObjectURL(compressed)
          blobUrlsRef.current.add(previewUrl)
          next.push({
            key: storageId,
            storageId,
            previewUrl,
            sizeBytes: compressed.size,
          })
        } else {
          const dataUrl = await readImageFile(compressed)
          if (!dataUrl) {
            toast.error(`Could not read ${file.name}`)
            continue
          }
          next.push({
            key: `legacy-${Date.now()}-${added}`,
            previewUrl: dataUrl,
            sizeBytes: compressed.size,
            legacyDataUrl: dataUrl,
          })
        }
        added += 1
      }

      if (added > 0) {
        onChange(next)
        toast.success(added === 1 ? t('reportPhoto.successAdded') : t('reportPhoto.successAddedMany').replace('{count}', String(added)))
      }
    } catch {
      toast.error(t('reportPhoto.errorUpload'))
    } finally {
      setUploading(false)
    }
  }

  function removePhoto(index: number) {
    const removed = value[index]
    if (removed && isBlobPreview(removed.previewUrl)) {
      URL.revokeObjectURL(removed.previewUrl)
    }
    onChange(value.filter((_, i) => i !== index))
  }

  const usageLabel =
    currentTotalBytes > 0
      ? `${formatPhotoSizeMb(currentTotalBytes)} / 50 MB`
      : `0 / 50 MB`

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept={REPORT_PHOTO_ACCEPT}
        multiple
        className="hidden"
        onChange={handlePhotoChange}
        disabled={uploading}
      />

      {value.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((photo, index) => (
            <div
              key={photo.key}
              className="relative overflow-hidden rounded-xl border border-border bg-muted"
            >
              <button
                type="button"
                className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-background/95 text-muted-foreground shadow-sm hover:bg-destructive/10 hover:text-destructive"
                onClick={() => removePhoto(index)}
                aria-label={t('reportPhoto.removeLabel').replace('{index}', String(index + 1))}
                disabled={uploading}
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <img
                src={photo.previewUrl}
                alt={`Report photo ${index + 1}`}
                className="aspect-square w-full object-cover"
              />
            </div>
          ))}
        </div>
      ) : null}

      {canAddMore ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:bg-accent/40 disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="mx-auto mb-2 h-7 w-7 animate-spin text-muted-foreground" />
          ) : value.length === 0 ? (
            <Camera className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />
          ) : (
            <Plus className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
          )}
          <p className="mb-1 text-sm font-medium text-foreground">
            {uploading
              ? t('reportPhoto.uploading')
              : value.length === 0
                ? t('reportPhoto.clickToUpload')
                : t('reportPhoto.addMore')}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('reportPhoto.helper').replace('{max}', String(maxPhotos)).replace('{count}', String(value.length)).replace('{usage}', usageLabel)}
          </p>
        </button>
      ) : null}

      {required && value.length === 0 ? (
        <p className="text-xs text-destructive">{t('reportPhoto.required')}</p>
      ) : null}
    </div>
  )
}
