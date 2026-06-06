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
import type { NewsEvent } from '@/data/events'
import { normalizeEmail } from '@/lib/admin'
import { formatDate, toIsoDateString } from '@/lib/dates'
import { toast } from 'sonner'

type DialogMode = 'view' | 'edit' | 'create'

type Props = {
  item: NewsEvent | null
  adminEmail: string
  mode: DialogMode
  open: boolean
  onOpenChange: (open: boolean) => void
}

function emptyNewsItem(type: NewsEvent['type'] = 'news'): NewsEvent {
  const prefix = type === 'event' ? 'ev' : 'nw'
  return {
    id: `${prefix}-${Date.now()}`,
    type,
    title: '',
    excerpt: '',
    body: '',
    date: toIsoDateString(),
    image: '',
    category: type === 'event' ? 'Conservation' : 'Updates',
  }
}

export function AdminNewsDialog({
  item,
  adminEmail,
  mode,
  open,
  onOpenChange,
}: Props) {
  const updateItem = useMutation(api.content.updateNewsItem)
  const createItem = useMutation(api.content.createNewsItem)
  const [saving, setSaving] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [draft, setDraft] = useState<NewsEvent | null>(null)

  const isView = mode === 'view'
  const isCreate = mode === 'create'

  const draftSyncKey = open
    ? isCreate
      ? 'create'
      : item
        ? item.id
        : null
    : null
  const [prevDraftSyncKey, setPrevDraftSyncKey] = useState<string | null>(null)
  if (draftSyncKey !== prevDraftSyncKey) {
    setPrevDraftSyncKey(draftSyncKey)
    if (draftSyncKey === 'create') {
      setDraft(emptyNewsItem('news'))
    } else if (item) {
      setDraft({ ...item })
    }
  }

  const displayItem = isCreate ? draft : item

  if (!open || !draft || (!isCreate && !displayItem)) return null

  async function handleSave() {
    if (!draft) return
    setSaving(true)
    try {
      const payload = {
        ...draft,
        title: draft.title.trim(),
        excerpt: draft.excerpt.trim(),
        body: draft.body.trim(),
        category: draft.category.trim(),
        image: draft.image.trim(),
      }
      const email = normalizeEmail(adminEmail)

      if (isCreate) {
        await createItem({
          adminEmail: email,
          item: {
            type: payload.type,
            title: payload.title,
            excerpt: payload.excerpt,
            body: payload.body,
            date: payload.date,
            image: payload.image,
            category: payload.category,
          },
        })
        toast.success('Item created')
      } else {
        await updateItem({ adminEmail: email, item: payload })
        toast.success('Item updated')
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save item')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isCreate ? 'Add news or event' : isView ? 'View item' : 'Edit item'}
          </DialogTitle>
          <DialogDescription className="capitalize">
            {isCreate ? 'Published on the public site after saving' : draft.type}
          </DialogDescription>
        </DialogHeader>

{!isCreate && displayItem?.image ? (
  <>
    <button
      type="button"
      onClick={() => setPreviewOpen(true)}
      className="w-full"
    >
      <img
        src={displayItem.image}
        alt={displayItem.title}
        className="max-h-40 w-full rounded-lg border border-border object-cover transition-transform duration-200 hover:scale-[1.01]"
      />
    </button>

    <Dialog
      open={previewOpen}
      onOpenChange={setPreviewOpen}
    >
      <DialogContent className="max-w-4xl border-0 bg-transparent shadow-none">
        <img
          src={displayItem.image}
          alt={displayItem.title}
          className="max-h-[85vh] w-full rounded-xl object-contain"
        />
      </DialogContent>
    </Dialog>
  </>
) : null}

        {isView && displayItem ? (
          <dl className="grid gap-3 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="capitalize">
                {displayItem.type}
              </Badge>
              <Badge variant="secondary">{displayItem.category}</Badge>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Title</dt>
              <dd className="font-medium">{displayItem.title}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Date</dt>
              <dd>{formatDate(displayItem.date)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Excerpt</dt>
              <dd className="text-muted-foreground">{displayItem.excerpt}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Body</dt>
              <dd className="text-muted-foreground">{displayItem.body}</dd>
            </div>
          </dl>
        ) : (
          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Type</label>
                <Select
                  value={draft.type}
                  onValueChange={(value) => {
                    if (!value) return
                    setDraft((d) => (d ? { ...d, type: value } : d))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="news">News</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Category</label>
                <Input
                  value={draft.category}
                  onChange={(e) => setDraft((d) => d && { ...d, category: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Title</label>
              <Input
                value={draft.title}
                onChange={(e) => setDraft((d) => d && { ...d, title: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Date</label>
              <Input
                type="date"
                value={draft.date}
                onChange={(e) => setDraft((d) => d && { ...d, date: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Image URL</label>
              <Input
                value={draft.image}
                onChange={(e) => setDraft((d) => d && { ...d, image: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Excerpt</label>
              <Textarea
                value={draft.excerpt}
                onChange={(e) => setDraft((d) => d && { ...d, excerpt: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Body</label>
              <Textarea
                value={draft.body}
                onChange={(e) => setDraft((d) => d && { ...d, body: e.target.value })}
                rows={4}
              />
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
