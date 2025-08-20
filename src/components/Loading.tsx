import { useEffect } from 'react'
import './loading.css'
import { LoadingProps } from '../types/Product'

export default function Loading({ open, text = 'Cargando…' }: LoadingProps) {
  // lock scroll while visible
  useEffect(() => {
    if (!open) return
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = overflow }
  }, [open])

  if (!open) return null

  return (
    <div className="loading-overlay" aria-hidden={!open}>
      <div className="loading-panel" role="status" aria-live="polite" aria-busy="true">
        <div className="spinner" aria-hidden="true" />
        <p className="loading-text">{text}</p>
      </div>
    </div>
  )
}
