import { useRef, useState } from 'react'
import { useMutation } from 'convex/react'
import { Camera, Loader2, X } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import { compressImage } from '@/lib/compressImage'
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
  const [progress, setProgress] = useState<{ loaded: number; total: number } | null>(null)

  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  async function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0]

    e.target.value = ''

    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.')
      return
    }

    try {
      setUploading(true)
      setProgress({ loaded: 0, total: file.size })

      const compressed = await compressImage(file)

      setProgress({ loaded: compressed.size, total: file.size })

      // Generate upload URL
      const uploadUrl = await generateUploadUrl()

      // Upload file to Convex Storage
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': compressed.type,
        },
        body: compressed,
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
      setProgress(null)
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

      {uploading && progress ? (
        <div className="rounded-xl border-2 border-dashed border-border p-4">
          <div className="flex items-center gap-3 mb-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
            <p className="text-sm text-foreground">Uploading image...</p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${Math.min((progress.loaded / progress.total) * 100, 100)}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {formatBytes(progress.loaded)} / {formatBytes(progress.total)}
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:bg-accent/40 disabled:opacity-60"
        >
          <Camera className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />

          <p className="mb-1 text-sm font-medium text-foreground">
            {value ? 'Replace image' : 'Click to upload image'}
          </p>

          <p className="text-xs text-muted-foreground">
            JPG, PNG, WebP
          </p>
        </button>
      )}
    </div>
  )
}
