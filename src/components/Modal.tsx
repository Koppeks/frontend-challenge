import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import './Modal.css'

type ModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  /** Disable closing by clicking the overlay (default: true) */
  closeOnOverlayClick?: boolean
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  closeOnOverlayClick = true,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
   const pressedOnOverlay = useRef(false)
  // Close on ESC
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Focus the modal panel when opened
  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => panelRef.current?.focus(), 0)
    return () => window.clearTimeout(t)
  }, [open])

  // Prevent background scroll while open
  useEffect(() => {
    if (!open) return
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
    }
  }, [open])

  if (!open) return null

  const overlay = (
    <div
      className="modal-overlay"
      role="presentation"

     onPointerDown={(e) => {
        pressedOnOverlay.current = e.target === e.currentTarget
      }}
      // close only if press started on overlay AND ended on overlay
      onPointerUp={(e) => {
        if (!closeOnOverlayClick) return
        const endedOnOverlay = e.target === e.currentTarget
        if (pressedOnOverlay.current && endedOnOverlay) onClose()
        pressedOnOverlay.current = false
      }}
      onPointerCancel={() => { pressedOnOverlay.current = false }}
    >
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 className="modal-title">{title}</h2>}
        <div className="modal-body">{children}</div>
        <button
          type="button"
          className="modal-close"
          aria-label="Cerrar"
          onClick={onClose}
        >
          ×
        </button>
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}
