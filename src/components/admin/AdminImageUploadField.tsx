import { useRef } from 'react'
import { Camera, X } from 'lucide-react'
import {
  MAX_IMAGE_FILE_BYTES,
  readImageFile,
} from '@/lib/imageUpload'
import { toast } from 'sonner'

type Props = {
  value: string
  onChange: (value: string) => void
  label?: string
}

export function AdminImageUploadField({ value, onChange, label = 'Image' }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (file.size > MAX_IMAGE_FILE_BYTES) {
      toast.error(`${file.name} must be 15 MB or smaller`)
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error(`${file.name} must be a JPG, PNG, or WebP image`)
      return
    }

    const dataUrl = await readImageFile(file)
    if (!dataUrl) {
      toast.error(`Could not read ${file.name}`)
      return
    }

    onChange(dataUrl)
    toast.success('Image uploaded')
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs text-muted-foreground">{label}</label>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
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
        className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:bg-accent/40"
      >
        <Camera className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />
        <p className="mb-1 text-sm font-medium text-foreground">
          {value ? 'Replace image' : 'Click to upload image'}
        </p>
        <p className="text-xs text-muted-foreground">JPG, PNG, WebP up to 5 MB</p>
      </button>
    </div>
  )
}
