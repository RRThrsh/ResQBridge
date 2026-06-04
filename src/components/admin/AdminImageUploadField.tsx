import { useRef, useState } from 'react'
import { useMutation } from 'convex/react'
import { Camera, Loader2, X } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import {
  MAX_IMAGE_FILE_BYTES,
  validateImageFile,
} from '@/lib/imageUpload'
import { toast } from 'sonner'

type Props = {
  value: string
  onChange: (value: string) => void
  label?: string
}

export function AdminImageUploadField({
  value,
  onChange,
  label = 'Image',
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 🐛 FIX 1: Changed api.storage to api.reportPhotoStorage
  const generateUploadUrl = useMutation(
    api.reportPhotoStorage.generateUploadUrl,
  )

  // 🐛 FIX 2: Changed api.storage to api.reportPhotoStorage
  const getImageUrl = useMutation(
    api.reportPhotoStorage.getImageUrl,
  )

  const [uploading, setUploading] = useState(false)

  async function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0]

    e.target.value = ''

    if (!file) return

    const validationError = validateImageFile(file)

    if (validationError) {
      toast.error(validationError)
      return
    }

    try {
      setUploading(true)

      // Generate upload URL
      const uploadUrl = await generateUploadUrl()

      // Upload file to Convex Storage
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const { storageId } = await response.json()

      // Get permanent image URL
      const imageUrl = await getImageUrl({
        storageId,
      })

      onChange(imageUrl)

      toast.success('Image uploaded')
    } catch {
      toast.error('Could not upload image')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs text-muted-foreground">
        {label}
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />

      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-border bg-muted">
          <button
            type="button"
            className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-background/95 text-muted-foreground shadow-sm hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onChange('')}
            aria-label="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          <img
            src={value}
            alt="Species preview"
            className="max-h-40 w-full object-cover"
          />
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:bg-accent/40 disabled:opacity-60"
      >
        {uploading ? (
          <Loader2 className="mx-auto mb-2 h-7 w-7 animate-spin text-muted-foreground" />
        ) : (
          <Camera className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />
        )}

        <p className="mb-1 text-sm font-medium text-foreground">
          {uploading
            ? 'Uploading image...'
            : value
              ? 'Replace image'
              : 'Click to upload image'}
        </p>

        <p className="text-xs text-muted-foreground">
          JPG, PNG, WebP up to {MAX_IMAGE_FILE_BYTES / 1024 / 1024} MB
        </p>
      </button>
    </div>
  )
}
