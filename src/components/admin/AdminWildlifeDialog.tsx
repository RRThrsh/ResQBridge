import { useState } from 'react'
import { useMutation } from 'convex/react'
import { Loader2 } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { WildlifeSpecies } from '@/data/wildlife'
import { statusLabels } from '@/data/wildlife'
import { AdminImageUploadField } from '@/components/admin/AdminImageUploadField'
import { normalizeEmail } from '@/lib/admin'
import { validateImageDataUrl } from '@/lib/imageUpload'
import { toast } from 'sonner'

type DialogMode = 'view' | 'edit' | 'create'

type Props = {
  species: WildlifeSpecies | null
  adminEmail: string
  mode: DialogMode
  open: boolean
  onOpenChange: (open: boolean) => void
}

function emptySpecies(): WildlifeSpecies {
  return {
    id: `species-${Date.now()}`,
    commonName: '',
    localName: '',
    scientificName: '',
    category: 'mammal',
    status: 'protected',
    habitat: '',
    diet: '',
    activeTime: 'diurnal',
    description: '',
    safetyTips: [],
    ecologicalImportance: '',
    images: [], 
    tags: [],
  }
}

export function AdminWildlifeDialog({
  species,
  adminEmail,
  mode,
  open,
  onOpenChange,
}: Props) {
  const updateItem = useMutation(api.content.updateWildlifeItem)
  const createItem = useMutation(api.content.createWildlifeItem)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState<WildlifeSpecies | null>(null)
  const [safetyTipsText, setSafetyTipsText] = useState('')
  const [tagsText, setTagsText] = useState('')

  const isView = mode === 'view'
  const isCreate = mode === 'create'

  const draftSyncKey = open
    ? isCreate
      ? 'create'
      : species
        ? species.id
        : null
    : null
  const [prevDraftSyncKey, setPrevDraftSyncKey] = useState<string | null>(null)
  
  if (draftSyncKey !== prevDraftSyncKey) {
    setPrevDraftSyncKey(draftSyncKey)
    if (draftSyncKey === 'create') {
      setDraft(emptySpecies())
      setSafetyTipsText('')
      setTagsText('')
    } else if (species) {
      setDraft({ ...species })
      setSafetyTipsText(species.safetyTips?.join('\n') || '')
      setTagsText(species.tags?.join(', ') || '')
    }
  }

  const displaySpecies = isCreate ? draft : species

  if (!open || !draft || (!isCreate && !displaySpecies)) return null

  function buildPayload(): WildlifeSpecies {
    const safetyTips = safetyTipsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
    const tags = tagsText
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    return {
      ...draft!,
      commonName: draft!.commonName.trim(),
      localName: draft!.localName.trim(),
      scientificName: draft!.scientificName.trim(),
      habitat: draft!.habitat.trim(),
      diet: draft!.diet.trim(),
      description: draft!.description.trim(),
      ecologicalImportance: draft!.ecologicalImportance.trim(),
      images: draft!.images || [], 
      safetyTips,
      tags,
      id: draft!.id,
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const payload = buildPayload()
      if (!payload.commonName || !payload.scientificName) {
        throw new Error('Common name and scientific name are required.')
      }

      if (payload.images && payload.images.length > 0) {
        for (const img of payload.images) {
          const imageError = validateImageDataUrl(img)
          if (imageError) {
            throw new Error(imageError)
          }
        }
      }

      const email = normalizeEmail(adminEmail)
      
      // --- FIX: Bridge frontend 'images' array to backend 'image' string ---
const convexItem = {
  ...payload,
}

      if (isCreate) {
        const { id, ...createPayload } = convexItem
        // Cast as any to bypass strict Convex generated types during DB insert
        await createItem({ adminEmail: email, item: createPayload as any })
        toast.success('Species created')
      } else {
        await updateItem({ adminEmail: email, item: convexItem as any })
        toast.success('Species updated')
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save species')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isCreate ? 'Add species' : isView ? 'View species' : 'Edit species'}
          </DialogTitle>
          <DialogDescription>
            {isCreate
              ? 'New entry for the public Wildlife Guide'
              : displaySpecies?.scientificName}
          </DialogDescription>
        </DialogHeader>

        {isView && displaySpecies?.images && displaySpecies.images.length > 0 ? (
          <img
            src={displaySpecies.images[0]}
            alt={displaySpecies.commonName}
            className="max-h-40 w-full rounded-lg border border-border object-cover"
          />
        ) : null}

        {isView && displaySpecies ? (
          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Common name</dt>
              <dd className="font-medium">{displaySpecies.commonName}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Local name</dt>
              <dd>{displaySpecies.localName}</dd>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="capitalize">
                {displaySpecies.category}
              </Badge>
              <Badge variant="secondary">{statusLabels[displaySpecies.status]}</Badge>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Habitat</dt>
              <dd className="text-muted-foreground">{displaySpecies.habitat}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Description</dt>
              <dd className="text-muted-foreground">{displaySpecies.description}</dd>
            </div>
          </dl>
        ) : (
          <div className="grid gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Common name</label>
              <Input
                value={draft.commonName}
                onChange={(e) => setDraft((d) => d && { ...d, commonName: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Local name</label>
              <Input
                value={draft.localName}
                onChange={(e) => setDraft((d) => d && { ...d, localName: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Scientific name</label>
              <Input
                value={draft.scientificName}
                onChange={(e) =>
                  setDraft((d) => d && { ...d, scientificName: e.target.value })
                }
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Category</label>
                <Select
                  value={draft.category}
                  onValueChange={(value) => {
                    if (!value) return
                    setDraft((d) => d && { ...d, category: value as any })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mammal">Mammal</SelectItem>
                    <SelectItem value="bird">Bird</SelectItem>
                    <SelectItem value="reptile">Reptile</SelectItem>
                    <SelectItem value="amphibian">Amphibian</SelectItem>
                    <SelectItem value="marine">Marine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Status</label>
                <Select
                  value={draft.status}
                  onValueChange={(value) => {
                    if (!value) return
                    setDraft((d) => d && { ...d, status: value as any })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critically-endangered">Critically endangered</SelectItem>
                    <SelectItem value="endangered">Endangered</SelectItem>
                    <SelectItem value="vulnerable">Vulnerable</SelectItem>
                    <SelectItem value="protected">Protected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Active time</label>
              <Select
                value={draft.activeTime}
                onValueChange={(value) => {
                  if (!value) return
                  setDraft((d) => d && { ...d, activeTime: value as any })
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diurnal">Diurnal</SelectItem>
                  <SelectItem value="nocturnal">Nocturnal</SelectItem>
                  <SelectItem value="crepuscular">Crepuscular</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Habitat</label>
              <Input
                value={draft.habitat}
                onChange={(e) => setDraft((d) => d && { ...d, habitat: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Diet</label>
              <Input
                value={draft.diet}
                onChange={(e) => setDraft((d) => d && { ...d, diet: e.target.value })}
              />
            </div>
            
<AdminImageUploadField
  label="Image 1"
  value={draft.images?.[0] || ''}
  onChange={(img) =>
    setDraft((d) =>
      d && {
        ...d,
        images: [
          img,
          d.images?.[1] || '',
          d.images?.[2] || '',
        ].filter(Boolean),
      }
    )
  }
/>

<AdminImageUploadField
  label="Image 2"
  value={draft.images?.[1] || ''}
  onChange={(img) =>
    setDraft((d) =>
      d && {
        ...d,
        images: [
          d.images?.[0] || '',
          img,
          d.images?.[2] || '',
        ].filter(Boolean),
      }
    )
  }
/>

<AdminImageUploadField
  label="Image 3"
  value={draft.images?.[2] || ''}
  onChange={(img) =>
    setDraft((d) =>
      d && {
        ...d,
        images: [
          d.images?.[0] || '',
          d.images?.[1] || '',
          img,
        ].filter(Boolean),
      }
    )
  }
/>
            
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Description</label>
              <Textarea
                value={draft.description}
                onChange={(e) => setDraft((d) => d && { ...d, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Ecological importance
              </label>
              <Textarea
                value={draft.ecologicalImportance}
                onChange={(e) =>
                  setDraft((d) => d && { ...d, ecologicalImportance: e.target.value })
                }
                rows={2}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Safety tips (one per line)
              </label>
              <Textarea
                value={safetyTipsText}
                onChange={(e) => setSafetyTipsText(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Tags (comma-separated)
              </label>
              <Input value={tagsText} onChange={(e) => setTagsText(e.target.value)} />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {isView ? 'Close' : 'Cancel'}
          </Button>
          {!isView ? (
            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isCreate ? (
                'Create'
              ) : (
                'Save changes'
              )}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
