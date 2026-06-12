import { useState } from 'react'
import Button from './Button.jsx'
import Modal from './Modal.jsx'

export default function DoubleConfirmation({
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  triggerLabel,
  triggerVariant = 'danger',
  triggerSize = 'md',
  triggerClassName = '',
  children,
}) {
  const [step, setStep] = useState(0)

  const handleTrigger = () => setStep(1)
  const handleCancel = () => setStep(0)
  const handleConfirm = () => {
    onConfirm()
    setStep(0)
  }

  return (
    <>
      {triggerLabel && (
        <Button
          variant={triggerVariant}
          size={triggerSize}
          onClick={handleTrigger}
          className={triggerClassName}
        >
          {triggerLabel}
        </Button>
      )}
      {children && <div onClick={handleTrigger}>{children}</div>}

      <Modal
        isOpen={step === 1}
        onClose={handleCancel}
        title={title}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={handleCancel}>
              {cancelText}
            </Button>
            <Button variant={triggerVariant} onClick={handleConfirm}>
              {confirmText}
            </Button>
          </>
        }
      >
        <p className="text-gray-600">{message}</p>
      </Modal>
    </>
  )
}
