import { useEffect } from 'react'
import './Loading.css'
import { LoadingProps } from '../types/Product'

/**
 * Un loading simplon, lo saque de internet.
 * Solo aplica con un suspence que wrappea a toda la app. 
 * 
 * No utilize este loading en componentes (Como cards o busqueda)
 * Ya que al ser mockup, carga todo instantaneo
 * 
 */

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
