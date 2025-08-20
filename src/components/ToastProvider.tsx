import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState
} from 'react'
import { createPortal } from 'react-dom'
import './ToastProvider.css'

/**
 * Una toast simple con muchisimas variables, esta la saque de chatgpt completamente,
 * Lo unico que cambie fueron los colores.
 * 
 * 
 */

type Variant = 'info' | 'success' | 'warning' | 'error'

type Toast = {
  id: string
  message: React.ReactNode
  title?: React.ReactNode
  variant: Variant
  /** Auto-dismiss in ms (default: 4500; errors: 7000). Set 0/undefined to keep until closed. */
  duration?: number
}

type ToastAPI = {
  show: (message: React.ReactNode, opts?: Partial<Omit<Toast, 'id' | 'message'>>) => string
  info:    (message: React.ReactNode, opts?: Partial<Omit<Toast, 'id' | 'message'>>) => string
  success: (message: React.ReactNode, opts?: Partial<Omit<Toast, 'id' | 'message'>>) => string
  warning: (message: React.ReactNode, opts?: Partial<Omit<Toast, 'id' | 'message'>>) => string
  error:   (message: React.ReactNode, opts?: Partial<Omit<Toast, 'id' | 'message'>>) => string
  dismiss: (id: string) => void
  dismissAll: () => void
}

const ToastContext = createContext<ToastAPI>({
  show: () => '',
  info: () => '',
  success: () => '',
  warning: () => '',
  error: () => '',
  dismiss: () => {},
  dismissAll: () => {},
})

function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(ts => ts.filter(t => t.id !== id))
  }, [])

  const dismissAll = useCallback(() => setToasts([]), [])

  const baseShow = useCallback(
    (message: React.ReactNode, opts?: Partial<Omit<Toast, 'id' | 'message'>>) => {
      const id = genId()
      const variant: Variant = (opts?.variant ?? 'info')
      const duration = opts?.duration ?? (variant === 'error' ? 7000 : 4500)
      setToasts(ts => [...ts, { id, message, title: opts?.title, variant, duration }])
      return id
    },
    []
  )

  const api: ToastAPI = useMemo(() => ({
    show: baseShow,
    info:    (m, o) => baseShow(m, { ...o, variant: 'info' }),
    success: (m, o) => baseShow(m, { ...o, variant: 'success' }),
    warning: (m, o) => baseShow(m, { ...o, variant: 'warning' }),
    error:   (m, o) => baseShow(m, { ...o, variant: 'error' }),
    dismiss,
    dismissAll,
  }), [baseShow, dismiss, dismissAll])

  // Close the newest toast on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && toasts.length) {
        dismiss(toasts[toasts.length - 1].id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toasts, dismiss])

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div className="toast-container" role="region" aria-label="Notificaciones">
          {toasts.map(t => (
            <ToastItem key={t.id} toast={t} onClose={() => dismiss(t.id)} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}

/** Single toast with auto-dismiss + pause on hover */
function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const timerRef = useRef<number | null>(null)
  const remainingRef = useRef<number>(toast.duration ?? 0)
  const startedAtRef = useRef<number>(0)

  const startTimer = useCallback(() => {
    if (!toast.duration) return
    startedAtRef.current = Date.now()
    timerRef.current = window.setTimeout(onClose, remainingRef.current)
  }, [toast.duration, onClose])

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    remainingRef.current = toast.duration ?? 0
    startTimer()
    return clearTimer
  }, [toast.id, toast.duration, startTimer, clearTimer])

  const onMouseEnter = () => {
    if (!toast.duration) return
    clearTimer()
    const elapsed = Date.now() - startedAtRef.current
    remainingRef.current = Math.max(0, remainingRef.current - elapsed)
  }

  const onMouseLeave = () => {
    if (!toast.duration) return
    startTimer()
  }

  const isAssertive = toast.variant === 'error' || toast.variant === 'warning'

  return (
    <div
      className={`toast toast--${toast.variant}`}
      data-variant={toast.variant}
      role={isAssertive ? 'alert' : 'status'}
      aria-live={isAssertive ? 'assertive' : 'polite'}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="toast__bar" aria-hidden="true" />
      <div className="toast__content">
        {toast.title && <div className="toast__title">{toast.title}</div>}
        <div className="toast__message">{toast.message}</div>
      </div>
      <button
        type="button"
        className="toast__close"
        aria-label="Cerrar notificación"
        onClick={onClose}
      >
        ×
      </button>
    </div>
  )
}
