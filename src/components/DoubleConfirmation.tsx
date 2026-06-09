import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/LanguageContext'

export type DoubleConfirmationProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  step1: {
    title: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
  }
  step2: {
    title: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
  }
  confirmVariant?: 'default' | 'destructive'
  loading?: boolean
  onConfirm: () => void | Promise<void>
}

export function DoubleConfirmation({
  open,
  onOpenChange,
  step1,
  step2,
  confirmVariant = 'destructive',
  loading = false,
  onConfirm,
}: DoubleConfirmationProps) {
  const { t } = useLanguage()
  const [step, setStep] = useState<'step1' | 'step2'>('step1')

  const current = step === 'step1' ? step1 : step2
  const confirmLabel = current.confirmLabel ?? (step === 'step1' ? t('confirm.confirm') : t('confirm.confirm'))
  const cancelLabel = current.cancelLabel ?? t('confirm.cancel')

  function handleClose() {
    onOpenChange(false)
  }

  function handleConfirm() {
    if (step === 'step1') {
      setStep('step2')
    } else {
      void onConfirm()
    }
  }

  function handleCancel() {
    if (step === 'step2') {
      setStep('step1')
    } else {
      handleClose()
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setStep('step1')
          onOpenChange(false)
        }
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'var(--font-heading)' }}>{current.title}</DialogTitle>
          <DialogDescription className="text-pretty leading-relaxed">{current.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            disabled={loading}
            onClick={handleConfirm}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
